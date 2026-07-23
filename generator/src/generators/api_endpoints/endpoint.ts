import type {
  ApiEndpoint,
  ApiPathParameter,
  ApiQueryParameters,
  MemberResponseBodySchema,
} from '@seed/api_endpoints/types';
import { errors } from '@seed/errors';
import { toPascalCase, toSnakeCase } from '../util';

const HTTP_STATUS_MAP: Record<string, string> = {
  OK: '200',
  CREATED: '201',
  NO_CONTENT: '204',
  BAD_REQUEST: '400',
  UNAUTHORIZED: '401',
  FORBIDDEN: '403',
  NOT_FOUND: '404',
  CONFLICT: '409',
  UNPROCESSABLE_ENTITY: '422',
  INTERNAL_SERVER_ERROR: '500',
};

export class Endpoint {
  readonly path: string;
  readonly method: string;
  readonly operationId: string;
  readonly summary: string;
  readonly description?: string;
  readonly tags?: string[];
  readonly pathParameters?: ApiPathParameter[];
  readonly queryParameters?: ApiQueryParameters;
  readonly requestBody?: { required: boolean; schema: string };
  readonly responses: {
    [statusCode: string]: {
      description: string;
      schema?: MemberResponseBodySchema;
      errors?: Array<{
        name: string;
        pname: string;
        errorCode: string;
        httpStatusCode: string;
        description?: string;
        dataSchema?: string;
      }>;
    };
  };
  readonly security?: string[];
  readonly cookieResponse?: boolean;
  readonly groupName?: string;
  readonly basePath?: string;
  readonly filePath?: string;

  constructor(
    endpoint: ApiEndpoint,
    groupName?: string,
    basePath?: string,
    filePath?: string,
  ) {
    this.path = endpoint.path;
    this.method = endpoint.method;
    this.operationId = endpoint.operationId;
    this.summary = endpoint.summary;
    this.description = endpoint.description;
    this.tags = endpoint.tags;
    this.pathParameters = endpoint.pathParameters;
    this.queryParameters = endpoint.queryParameters;
    this.requestBody = endpoint.requestBody;
    this.security = endpoint.security;
    this.cookieResponse = endpoint.cookieResponse;
    this.groupName = groupName;
    this.basePath = basePath;
    this.filePath = filePath;

    // Convert successResponse/errorResponses to responses format
    const responses: Endpoint['responses'] = {};

    // Success response
    if (endpoint.successResponse.type === 'empty') {
      responses['200'] = { description: '成功' };
    } else {
      responses['200'] = {
        description: '成功',
        schema: endpoint.successResponse,
      };
    }

    // Error responses - 同じステータスコードのエラーはまとめて記述する
    const errorsByStatus = new Map<
      string,
      Array<{
        name: string;
        pname: string;
        errorCode: string;
        httpStatusCode: string;
        description?: string;
        dataSchema?: string;
      }>
    >();
    for (const err of endpoint.errorResponses) {
      const errorDef = errors.member.find((e) => e.lname === err.name);
      if (errorDef) {
        const statusCode = HTTP_STATUS_MAP[errorDef.httpStatusCode] ?? '500';
        if (!errorsByStatus.has(statusCode)) {
          errorsByStatus.set(statusCode, []);
        }
        errorsByStatus.get(statusCode)?.push({
          name: errorDef.lname,
          pname: errorDef.pname,
          errorCode: errorDef.errorCode,
          httpStatusCode: errorDef.httpStatusCode,
          description: err.description,
          dataSchema: err.dataSchema,
        });
      }
    }
    for (const [statusCode, errs] of errorsByStatus) {
      responses[statusCode] = {
        description: errs.map((e) => e.name).join(' / '),
        errors: errs,
      };
    }

    this.responses = responses;
  }

  get fullPath(): string {
    return `${this.basePath ?? ''}${this.path}`;
  }

  public getRustType(type: string, format?: string, entityId?: string): string {
    if (format === 'uuid' && entityId) return `id::${entityId}`;
    if (format === 'uuid') return 'Uuid';
    switch (type) {
      case 'string':
        return 'String';
      case 'number':
        return 'i64';
      case 'boolean':
        return 'bool';
      default:
        return 'String';
    }
  }

  public getTypescriptType(type: string, format?: string): string {
    if (format === 'id') return 'string';
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string';
    }
  }

  public getPathParamsStructName(): string {
    return `${toPascalCase(this.operationId)}PathParams`;
  }

  public generatePathParamsStruct(): string | undefined {
    if (!this.pathParameters || this.pathParameters.length === 0) {
      return undefined;
    }

    const structName = this.getPathParamsStructName();
    const fields = this.pathParameters
      .map((param) => {
        const rustType = this.getRustType(
          param.type,
          param.format,
          param.entityId,
        );
        const fieldName = toSnakeCase(param.name);
        const comment = param.description ? ` // ${param.description}` : '';
        return `    pub ${fieldName}: ${rustType},${comment}`;
      })
      .join('\n');

    return [
      `#[derive(Debug, Deserialize)]`,
      `pub struct ${structName} {`,
      fields,
      '}',
    ].join('\n');
  }

  public determineResponseTypeFromSchema(
    responseSchema?: MemberResponseBodySchema,
  ): {
    returnType: string;
    apiMethod: string;
    wrapperType: string;
  } {
    if (!responseSchema) {
      return {
        returnType: 'Promise<void>',
        apiMethod: 'requestEmpty',
        wrapperType: '',
      };
    }

    switch (responseSchema.type) {
      case 'data':
        return {
          returnType: `Promise<ApiDataResponse<${responseSchema.dataSchema}>>`,
          apiMethod: 'requestGetData',
          wrapperType: responseSchema.dataSchema,
        };
      case 'list':
        return {
          returnType: `Promise<ApiListResponse<${responseSchema.itemSchema}>>`,
          apiMethod: 'requestGetList',
          wrapperType: responseSchema.itemSchema,
        };
      case 'id':
        return {
          returnType: 'Promise<ApiDataResponse<IdResponse>>',
          apiMethod: 'requestGetData',
          wrapperType: 'IdResponse',
        };
      default:
        return {
          returnType: 'Promise<void>',
          apiMethod: 'requestEmpty',
          wrapperType: '',
        };
    }
  }
}
