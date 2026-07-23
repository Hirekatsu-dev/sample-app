import type { Endpoint } from '../../api_endpoints/endpoint';
import type { EndpointGroup } from '../../api_endpoints/endpoint_group';
import { toPascalCase, toSnakeCase } from '../../util';

/**
 * エンドポイントごとのエラー型を生成する。
 * 共通の `ApiError` をラップした struct とし、そのエンドポイントで発生し得るエラーごとに
 * コンストラクタを生成することで「どのエラーを返せるか」をコンパイル時に保証する。
 * レスポンス生成とログ出力は `ApiError` に委譲する。
 */
const generateErrorStruct = (endpoint: Endpoint): string => {
  const structName = `${toPascalCase(endpoint.operationId)}Error`;

  // 全ステータスコードのエラーをフラットに収集
  const errorVariants: Array<{ pname: string; errorCode: string }> = [];
  for (const [, response] of Object.entries(endpoint.responses)) {
    if (response.errors) {
      for (const err of response.errors) {
        errorVariants.push({ pname: err.pname, errorCode: err.errorCode });
      }
    }
  }

  if (errorVariants.length === 0) return '';

  // エラー種別ごとのコンストラクタ（error_code から status とログレベルを決める）
  const constructors = errorVariants
    .map((e) =>
      [
        `    /// ${e.errorCode}`,
        `    pub fn ${toSnakeCase(e.pname)}(log_level: tracing::Level) -> Self {`,
        `        Self {`,
        `            error: ApiError::new(ErrorCode::${e.pname}, log_level),`,
        `        }`,
        `    }`,
      ].join('\n'),
    )
    .join('\n\n');

  return [
    `pub struct ${structName} {`,
    `    error: ApiError,`,
    `}`,
    ``,
    `#[allow(dead_code)]`,
    `impl ${structName} {`,
    constructors,
    ``,
    `    /// クライアントに返すメッセージを設定する`,
    `    pub fn with_message<T: Into<String>>(mut self, message: T) -> Self {`,
    `        self.error = self.error.with_message(message);`,
    `        self`,
    `    }`,
    ``,
    `    /// サーバーログに残すメッセージを設定する`,
    `    pub fn with_log_message<T: Into<String>>(mut self, message: T) -> Self {`,
    `        self.error = self.error.with_log_message(message);`,
    `        self`,
    `    }`,
    ``,
    `    /// サーバーログに残す追加フィールドを設定する（DBエラー等の詳細を載せる）`,
    `    pub fn with_log_fields<K: Into<String>, V: Into<serde_json::Value>>(`,
    `        mut self,`,
    `        key: K,`,
    `        value: V,`,
    `    ) -> Self {`,
    `        self.error = self.error.with_log_fields(key, value);`,
    `        self`,
    `    }`,
    `}`,
    ``,
    `impl IntoResponse for ${structName} {`,
    `    fn into_response(self) -> axum::response::Response {`,
    `        self.error.into_response()`,
    `    }`,
    `}`,
  ].join('\n');
};

export const buildRustHandlerText = (group: EndpointGroup): string => {
  // 関数名の重複チェック
  const functionNames = new Set<string>();
  const duplicateNames: string[] = [];
  for (const endpoint of group.endpoints) {
    const functionName = toSnakeCase(endpoint.operationId);
    if (functionNames.has(functionName)) {
      duplicateNames.push(functionName);
    } else {
      functionNames.add(functionName);
    }
  }

  if (duplicateNames.length > 0) {
    throw new Error(
      `Duplicate Rust handler function names found in ${group.name}: ${duplicateNames.join(', ')}`,
    );
  }

  // パスパラメータのstruct定義を収集
  const pathParamStructs = group.endpoints
    .map((e) => e.generatePathParamsStruct())
    .filter((struct): struct is string => struct !== undefined);

  const handlers = group.endpoints
    .map((e) => {
      const methodName = toSnakeCase(e.operationId);
      const successResponseType = Object.entries(e.responses).find(([status]) =>
        status.startsWith('2'),
      )?.[1];

      // MemberResponseBodySchemaの処理
      let responseType = '()';
      if (successResponseType?.schema) {
        if (typeof successResponseType.schema === 'string') {
          responseType = successResponseType.schema;
        } else {
          // オブジェクト形式のMemberResponseBodySchema
          switch (successResponseType.schema.type) {
            case 'data':
              responseType = successResponseType.schema.dataSchema;
              break;
            case 'list':
              responseType = successResponseType.schema.itemSchema;
              break;
            case 'id':
              responseType = `IdResponse<id::${successResponseType.schema.entityId}>`;
              break;
            default:
              responseType = '()';
          }
        }
      }

      // axumのextractorパラメータ（auth, state, header, json の順）
      const isOptionalAuth =
        e.security?.includes('OptionalBearerAuth') ?? false;
      const requiresAuth = !isOptionalAuth && (e.security?.length ?? 0) > 0;

      const extractorParams = [
        requiresAuth ? 'auth: AuthorizedUser' : undefined,
        isOptionalAuth ? 'auth: Option<AuthorizedUser>' : undefined,
        'State(state): State<AppState>',
        'headers: HeaderMap',
        e.cookieResponse ? 'jar: CookieJar' : undefined,
        e.pathParameters && e.pathParameters.length > 0
          ? `Path(path_params): Path<${e.getPathParamsStructName()}>`
          : undefined,
        e.requestBody ? `Json(body): Json<${e.requestBody.schema}>` : undefined,
        e.queryParameters
          ? `Query(query): Query<${e.queryParameters.schema}>`
          : undefined,
      ].filter((param) => param !== undefined);

      const paramList = extractorParams.join(',\n\t');

      // RequestContextの構築
      const authValue = requiresAuth
        ? 'Some(&auth)'
        : isOptionalAuth
          ? 'auth.as_ref()'
          : 'None';

      // ハンドラの呼び出しパラメータ構築
      const handlerParams = [
        e.requestBody ? 'body' : undefined,
        e.pathParameters && e.pathParameters.length > 0
          ? 'path_params'
          : undefined,
        e.queryParameters ? 'query' : undefined,
      ].filter((param): param is string => param !== undefined);

      handlerParams.push('&ctx');
      if (e.cookieResponse) handlerParams.push('jar');
      const handlerParamList = handlerParams.join(', ');

      // filePathを使って適切なhandlersパスを生成
      const handlersPath = group.filePath
        ? group.filePath.replace(/\//g, '::')
        : e.groupName;

      const errorEnumName = `${toPascalCase(e.operationId)}Error`;
      const hasErrors = Object.values(e.responses).some(
        (r) => r.errors && r.errors.length > 0,
      );
      const fnReturnType = e.cookieResponse
        ? hasErrors
          ? `Result<(CookieJar, Json<ApiResponse<${responseType}>>), ${errorEnumName}>`
          : `Result<(CookieJar, Json<ApiResponse<${responseType}>>), ApiError>`
        : hasErrors
          ? `Result<Json<ApiResponse<${responseType}>>, ${errorEnumName}>`
          : `ApiResult<${responseType}>`;

      const content = [
        `/// ${e.summary}`,
        e.description ? `/// ${e.description}` : undefined,
        '#[allow(dead_code)]',
        `pub async fn ${methodName}(`,
        `\t${paramList},`,
        `) -> ${fnReturnType} {`,
        '\tlet ctx = RequestContext {',
        '\t\tstate,',
        `\t\tuser: ${authValue},`,
        '\t\theaders,',
        '\t};',
        '',
        `\tcrate::handler::handlers${handlersPath}::${methodName}(${handlerParamList}).await`,
        '}',
      ];

      return content.filter((line) => line !== undefined).join('\n');
    })
    .join('\n\n');

  // エラー型の生成
  const errorEnumTexts = group.endpoints
    .map((e) => generateErrorStruct(e))
    .filter((s) => s !== '');

  const hasCookieResponse = group.endpoints.some((e) => e.cookieResponse);

  const useContents =
    group.endpoints.length > 0
      ? [
          '#[allow(unused_imports)]',
          'use axum::{extract::{Json, Path, Query, State}, http::{StatusCode, HeaderMap}, response::IntoResponse};',
          hasCookieResponse ? 'use axum_extra::extract::CookieJar;' : undefined,
          '#[allow(unused_imports)]',
          'use serde::Deserialize;',
          '#[allow(unused_imports)]',
          'use serde_json::json;',
          '#[allow(unused_imports)]',
          'use crate::model::id;',
          '#[allow(unused_imports)]',
          'use crate::model::IdResponse;',
          '#[allow(unused_imports)]',
          'use crate::model::generated::*;',
          '#[allow(unused_imports)]',
          'use crate::handler_context::RequestContext;',
          '#[allow(unused_imports)]',
          'use crate::extractor::AuthorizedUser;',
          '#[allow(unused_imports)]',
          'use crate::error::AppError;',
          '#[allow(unused_imports)]',
          'use crate::error_code::ErrorCode;',
          '#[allow(unused_imports)]',
          'use crate::error::ApiError;',
          '#[allow(unused_imports)]',
          'use crate::response::{ApiResponse, ApiResult};',
          '#[allow(unused_imports)]',
          'use crate::state::AppState;',
        ].filter((line) => line !== undefined)
      : [];

  const content = [
    '// このファイルは generator/src/generators/api_endpoints.ts から生成されます。',
    '// 直接編集しないでください。',
    '',
    ...useContents,
    group.endpoints.length === 0 ? undefined : '',
    ...group.subEndpoints.map(
      (subEndpoints) => `pub mod ${subEndpoints.name};`,
    ),
    group.subEndpoints.length === 0 ? undefined : '',
    // パスパラメータのstruct定義を追加
    ...pathParamStructs,
    pathParamStructs.length > 0 ? '' : undefined,
    // エラー型の定義
    ...errorEnumTexts.flatMap((t) => [t, '']),
    handlers,
    '',
  ];

  return content.filter((row) => row !== undefined).join('\n');
};

export const buildHandlerStubContent = (
  group: EndpointGroup,
  subModuleNames: string[] = [],
): string => {
  // generated モジュールのパス（エラー型のインポート先）
  const generatedModulePath = `crate::handler::generated${(group.filePath ?? '').replace(/\//g, '::')}`;

  // このグループのエラー型名を収集
  const errorTypeNames = group.endpoints
    .filter((e) =>
      Object.values(e.responses).some((r) => r.errors && r.errors.length > 0),
    )
    .map((e) => `${toPascalCase(e.operationId)}Error`);

  const handlerFunctions = group.endpoints
    .map((endpoint) => {
      const methodName = toSnakeCase(endpoint.operationId);
      const errorEnumName = `${toPascalCase(endpoint.operationId)}Error`;
      const hasErrors = Object.values(endpoint.responses).some(
        (r) => r.errors && r.errors.length > 0,
      );

      // パラメータを構築
      const params = [];
      if (endpoint.requestBody) {
        params.push(`_req: ${endpoint.requestBody.schema}`);
      }
      if (endpoint.pathParameters && endpoint.pathParameters.length > 0) {
        params.push(`_path_params: ${endpoint.getPathParamsStructName()}`);
      }
      if (endpoint.queryParameters) {
        params.push(`_query: ${endpoint.queryParameters.schema}`);
      }
      params.push("_ctx: &RequestContext<'_>");
      if (endpoint.cookieResponse) {
        params.push('_jar: CookieJar');
      }

      // レスポンス型を決定
      const successResponseType = Object.entries(endpoint.responses).find(
        ([status]) => status.startsWith('2'),
      )?.[1];

      let responseType = '()';
      if (successResponseType?.schema) {
        switch (successResponseType.schema.type) {
          case 'data':
            responseType = successResponseType.schema.dataSchema;
            break;
          case 'list':
            responseType = successResponseType.schema.itemSchema;
            break;
          case 'id':
            responseType = `IdResponse<id::${successResponseType.schema.entityId}>`;
            break;
          default:
            responseType = '()';
        }
      }

      const fnReturnType = endpoint.cookieResponse
        ? hasErrors
          ? `Result<(CookieJar, Json<ApiResponse<${responseType}>>), ${errorEnumName}>`
          : `Result<(CookieJar, Json<ApiResponse<${responseType}>>), ApiError>`
        : hasErrors
          ? `Result<Json<ApiResponse<${responseType}>>, ${errorEnumName}>`
          : `ApiResult<${responseType}>`;

      const paramList = params.join(',\n    ');

      return [
        `/// ${endpoint.summary}`,
        endpoint.description ? `/// ${endpoint.description}` : undefined,
        `pub async fn ${methodName}(`,
        `    ${paramList},`,
        `) -> ${fnReturnType} {`,
        `    // TODO: ${endpoint.summary}の実装`,
        `    todo!()`,
        `}`,
      ]
        .filter((line) => line !== undefined)
        .join('\n');
    })
    .join('\n\n');

  const subModDeclarations = subModuleNames.map((name) => `pub mod ${name};`);

  const errorImport =
    errorTypeNames.length > 0
      ? [`use ${generatedModulePath}::{${errorTypeNames.join(', ')}};`]
      : [];

  const content = [
    '// このファイルは generator2 によって初回生成されます。',
    '// 生成後は手動で編集してください。',
    '',
    'use axum::Json;',
    'use crate::{',
    '    handler_context::RequestContext,',
    '    response::ApiResponse,',
    '};',
    ...errorImport,
    '// use crate::error::AppError; // 必要に応じて追加',
    '// use crate::model::generated::*;',
    '// use crate::model::id;',
    '// use crate::model::IdResponse;',
    '',
    ...subModDeclarations,
    subModDeclarations.length > 0 ? '' : undefined,
    handlerFunctions,
    '',
  ];

  return content.filter((line) => line !== undefined).join('\n');
};

export const buildModContent = (
  group: EndpointGroup,
  _basePath: string,
): string => {
  // 現在のグループにファイルがある場合はpubを追加
  const currentGroupMod =
    group.endpoints.length > 0 ? [`pub mod ${group.name};`] : [];

  // サブグループのmodを追加
  const subGroupMods = Object.values(group.subEndpoints).map(
    (subGroup) => `pub mod ${subGroup.name};`,
  );

  const content = [
    '// このファイルは generator2 によって初回生成されます。',
    '// 必要に応じて手動で編集してください。',
    '',
    ...currentGroupMod,
    ...subGroupMods,
    '',
  ];

  return content.filter((line) => line.trim() !== '').join('\n');
};
