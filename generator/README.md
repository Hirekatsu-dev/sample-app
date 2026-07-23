# Generator（コード生成）システム

このドキュメントでは、generatorの定義方法と自動生成の実行方法について説明します。

## 目次

1. [概要](#概要)
2. [区分値の定義方法](#区分値の定義方法)
3. [エラーコードの定義方法](#エラーコードの定義方法)
4. [テーブルの定義方法](#テーブルの定義方法)
5. [エンティティIDの定義方法](#エンティティidの定義方法)
6. [APIスキーマの定義方法](#apiスキーマの定義方法)
7. [APIエンドポイントの定義方法](#apiエンドポイントの定義方法)
8. [画面定義の方法](#画面定義の方法)
9. [自動生成方法](#自動生成方法)
10. [新機能追加の手順](#新機能追加の手順)

---

## 概要

generatorは、TypeScriptで記述した定義ファイルから以下のコードを自動生成します：

- **SQL**: テーブル定義、外部キー制約
- **Rust**: 型定義、APIハンドラーのルーティング、リクエスト/レスポンス構造体
- **TypeScript**: APIクライアント、型定義
- **Vue**: ページコンポーネントのEntryPoint、Props型定義
- **Markdown**: ER図、テーブル詳細、画面遷移図、画面詳細

### ディレクトリ構造

```
generator/src/seed/
├── kbns/               # 区分値定義
│   └── index.ts
├── errors/             # エラーコード定義
│   ├── index.ts
│   └── difinitions/
│       └── member.ts
├── tables/             # テーブル定義
│   ├── index.ts
│   ├── base.ts
│   ├── domain.ts
│   ├── foreign_key_helpers.ts
│   └── definitions/
│       ├── users.ts
│       └── media.ts
├── entity_ids/         # エンティティID定義
│   └── index.ts
├── api_schemas/        # APIスキーマ定義
│   ├── index.ts
│   ├── types.ts
│   └── definitions/
│       └── member_api/
│           ├── index.ts
│           ├── auth.ts
│           └── user.ts
├── api_endpoints/      # APIエンドポイント定義
│   ├── index.ts
│   ├── types.ts
│   └── definitions/
│       └── member_api/
│           ├── index.ts
│           ├── auth.ts
│           └── v1/
│               ├── users.ts
│               └── media.ts
└── pages/              # 画面定義
    ├── base.ts
    ├── index.ts
    └── definitions/
        ├── auth.ts
        └── problems.ts
```

---

## 区分値の定義方法

区分値は、ドロップダウンリストやステータスなど、固定の選択肢を持つ値に使用します。

### ファイル

`generator/src/seed/kbns/index.ts`

### 構造

```typescript
export type Kbn = {
  id: string;       // 区分値のID（スネークケース）
  name: string;     // 区分値の表示名
  values: KbnValue[];  // 区分値の選択肢
};

export type KbnValue = {
  id: string;       // 値のID（スネークケース）
  name: string;     // 値の表示名
};
```

### サンプル

```typescript
export const kbns = [
  {
    id: 'media_type',
    name: 'メディア種別',
    values: [
      { id: 'profile_image', name: 'プロフィール画像' },
    ],
  },
  // 新しい区分値を追加する例
  {
    id: 'task_status',
    name: 'タスク状態',
    values: [
      { id: 'pending', name: '未着手' },
      { id: 'in_progress', name: '進行中' },
      { id: 'completed', name: '完了' },
      { id: 'cancelled', name: 'キャンセル' },
    ],
  },
  {
    id: 'priority',
    name: '優先度',
    values: [
      { id: 'low', name: '低' },
      { id: 'medium', name: '中' },
      { id: 'high', name: '高' },
    ],
  },
] as const satisfies readonly Kbn[];
```

---

## エラーコードの定義方法

APIが返すエラーコードを定義します。

### ファイル

- メインのエクスポート: `generator/src/seed/errors/index.ts`
- 定義ファイル: `generator/src/seed/errors/difinitions/member.ts`

### 構造

```typescript
export type ApiResultCode = {
  name: string;         // エラーコード名（PascalCase）
  message: string;      // エラーメッセージ
  httpStatusCode: string;  // HTTPステータスコード
};
```

### サンプル

```typescript
// generator/src/seed/errors/difinitions/member.ts
import type { ApiResultCode } from '..';

export const memberApiErrors: ApiResultCode[] = [
  {
    httpStatusCode: 'OK',
    name: 'Success',
    message: '成功しました。',
  },
  {
    httpStatusCode: 'INTERNAL_SERVER_ERROR',
    name: 'Unknown',
    message: '不明なエラーが発生しました。',
  },
  {
    httpStatusCode: 'BAD_REQUEST',
    name: 'InvalidParameter',
    message: 'パラメータが不正です。',
  },
  {
    httpStatusCode: 'UNAUTHORIZED',
    name: 'LoginFailure',
    message: 'ログインに失敗しました。',
  },
  {
    httpStatusCode: 'NOT_FOUND',
    name: 'NotFound',
    message: 'データが見つかりませんでした。',
  },
  // 新しいエラーを追加する例
  {
    httpStatusCode: 'FORBIDDEN',
    name: 'PermissionDenied',
    message: 'アクセス権限がありません。',
  },
  {
    httpStatusCode: 'CONFLICT',
    name: 'DuplicateEntry',
    message: '既に存在するデータです。',
  },
];
```

---

## テーブルの定義方法

データベーステーブルの構造を定義します。

### ファイル

- テーブル定義: `generator/src/seed/tables/definitions/` 配下に各テーブルのファイル
- インデックス: `generator/src/seed/tables/index.ts`
- ドメイン定義: `generator/src/seed/tables/domain.ts`

### ドメイン（カラム型の定義）

ドメインは、カラムの型テンプレートです。`domain.ts`で定義されています。

| ドメイン | pname（物理名のサフィックス） | PostgreSQL型 | 用途 |
|---------|------------------------------|--------------|------|
| `UUID` | `uuid` | UUID | 主キー、外部キー |
| `UUID配列` | `uuid_array` | UUID[] | UUIDの配列 |
| `数` | `count` | BIGINT | 数値全般 |
| `日時` | `at` | TIMESTAMPTZ | 日時 |
| `JSON` | `json` | JSONB | JSONデータ |
| `内容` | `content` | TEXT | 長いテキスト |
| `コード` | `code` | TEXT | 短いコード値 |
| `区分` | `kbn` | TEXT | 区分値 |
| `名前` | `name` | TEXT | 名前、タイトル |
| `メール` | `mail` | TEXT | メールアドレス |
| `ダイジェスト` | `digest` | TEXT | ハッシュ値 |
| `URL` | `url` | TEXT | URL |
| `フラグ` | `flag` | TEXT | フラグ値 |
| `説明` | `description` | TEXT | 説明文 |

### テーブル定義の構造

```typescript
import { defineTable } from '../base';

export const myTable = defineTable({
  name: 'テーブル名',   // スネークケース
  columns: [
    // カラム定義
  ] as const,
  primaryKeys: ['主キーカラム名'],
  // オプション
  uniqueKeys?: [['unique_column']],
  indices?: [{ columns: ['indexed_column'] }],
});
```

### システムカラム（自動追加）

すべてのテーブルには以下のシステムカラムが自動的に追加されます。定義ファイルに記述する必要はありません。

| カラム名 | 型 | NULL | 説明 |
|---------|-----|------|------|
| `created_at` | TIMESTAMPTZ | NOT NULL | 作成日時（デフォルト: NOW()） |
| `updated_at` | TIMESTAMPTZ | NOT NULL | 更新日時（デフォルト: NOW()） |
| `deleted_at` | TIMESTAMPTZ | NULL | 削除日時（論理削除用） |
| `created_uuid` | UUID | NOT NULL | 作成者UUID |
| `updated_uuid` | UUID | NOT NULL | 更新者UUID |
| `deleted_uuid` | UUID | NULL | 削除者UUID |
| `meta_json` | JSONB | NOT NULL | メタデータ（デフォルト: '{}'） |

### カラム定義

```typescript
// 基本形：ドメインのみ指定（pnameとlnameはドメインから自動設定）
{ domain: 'UUID' }  // -> カラム名: uuid

// プレフィックス付き（推奨：関連を明確にする）
{ pname: 'user', domain: 'UUID' }  // -> カラム名: user_uuid

// 完全指定
{
  pname: 'profile_image_medium',   // 物理名のプレフィックス
  lname: 'プロフィール画像メディア', // 論理名
  domain: 'UUID',
  notNull: false,                   // NULL許可（デフォルトはtrue）
  default: 'NULL',                  // デフォルト値
}  // -> カラム名: profile_image_medium_uuid

// 区分値カラム（kbnプロパティで区分値IDを指定）
{
  pname: 'status',
  lname: 'ステータス',
  domain: '区分',
  kbn: 'task_status',  // 区分値ID（generator/src/seed/kbns/index.tsで定義）
  description: 'タスクの状態',
}  // -> カラム名: status_kbn、SQLコメントに区分値名が追加される
```

**区分値の指定について:**
- `domain: '区分'` または `domain: '区分配列'` のカラムには、`kbn` プロパティで区分値IDを指定します
- 指定した区分値IDは `generator/src/seed/kbns/index.ts` で定義されている必要があります
- 生成されるSQLのコメントに区分値名が `[区分値名]` の形式で追加されます


### サンプル：タスクテーブルの追加

```typescript
// generator/src/seed/tables/definitions/tasks.ts
import { defineTable } from '../base';
import { defineForeignKey, referencesTable } from '../foreign_key_helpers';

export const tasksTable = defineTable({
  name: 'tasks',
  columns: [
    // 主キー
    { domain: 'UUID' },  // -> カラム名: uuid

    // 基本情報
    { domain: 'タイトル' },  // -> カラム名: title
    { domain: '内容' },  // -> カラム名: content

    // ステータス（区分値を使用）
    { pname: 'status', lname: 'ステータス', domain: '区分', kbn: 'task_status' },  // -> カラム名: status_kbn
    { pname: 'priority', lname: '優先度', domain: '区分', kbn: 'priority' },  // -> カラム名: priority_kbn

    // リレーション
    { pname: 'user', lname: 'ユーザー', domain: 'UUID' },  // -> カラム名: user_uuid
    { pname: 'project', lname: 'プロジェクト', domain: 'UUID', notNull: false },  // -> カラム名: project_uuid

    // 日時
    { pname: 'due', lname: '期限', domain: '日時', notNull: false },  // -> カラム名: due_at
  ] as const,

  primaryKeys: ['uuid'],
  indices: [
    { columns: ['user_uuid'] },
    { columns: ['status_kbn'] },
  ],
});

// 外部キー制約
export const tasksTableForeignKeys = [
  defineForeignKey({
    sourceTable: 'tasks',
    columns: ['user_uuid'],
    ...referencesTable('users', ['uuid'], {
      onDelete: 'CASCADE',
      onUpdate: 'RESTRICT',
    }),
  }),
];
```

### 外部キー制約の定義

```typescript
import { defineForeignKey, referencesTable } from '../foreign_key_helpers';

// パターン1: referencesTableヘルパーを使用（推奨）
defineForeignKey({
  sourceTable: 'tasks',
  columns: ['user_uuid'],
  ...referencesTable('users', ['uuid'], {
    onDelete: 'CASCADE',   // 親削除時に子も削除
    onUpdate: 'RESTRICT',  // 親更新時は制限
  }),
})

// パターン2: 完全指定
defineForeignKey({
  sourceTable: 'tasks',
  columns: ['user_uuid'],
  referencedTable: 'users',
  referencedColumns: ['uuid'],
  onDelete: 'CASCADE',
  onUpdate: 'RESTRICT',
})
```

### index.tsへの追加

新しいテーブルを追加したら、`generator/src/seed/tables/index.ts`に登録します：

```typescript
// generator/src/seed/tables/index.ts
import { tasksTable, tasksTableForeignKeys } from './definitions/tasks';

export const tables = [
  usersTable,
  userSessionsTable,
  passwordResetTokensTable,
  mediaTable,
  tasksTable,  // 追加
] as const satisfies readonly Table[];

export const foreignKeys = [
  ...mediaTableForeignKeys,
  ...passwordResetTokensTableForeignKeys,
  ...userSessionsTableForeignKeys,
  ...usersTableForeignKeys,
  ...tasksTableForeignKeys,  // 追加
] as const;
```

---

## エンティティIDの定義方法

UUIDの型安全性を保つためのエンティティID定義です。新しいエンティティを追加する際は必ずここに追加してください。

### ファイル

`generator/src/seed/entity_ids/index.ts`

### サンプル

```typescript
// 既存のエンティティID
export const entityIds = ['UserId', 'MediaId'] as const;

// 新しいエンティティを追加する例
export const entityIds = [
  'UserId',
  'MediaId',
  'TaskId',      // 追加
  'ProjectId',   // 追加
] as const;

export type EntityId = (typeof entityIds)[number];
```

**重要**: APIスキーマでUUID型を使用する場合、対応するエンティティIDがここに定義されている必要があります。

---

## APIスキーマの定義方法

APIのリクエスト/レスポンスの型を定義します。

### ファイル

- 型定義: `generator/src/seed/api_schemas/types.ts`
- 定義ファイル: `generator/src/seed/api_schemas/definitions/member_api/` 配下

### スキーマ命名規則

| 種類 | 命名パターン | 例 |
|------|-------------|-----|
| リクエスト（Body） | `{Action}{Resource}RequestParams` | `CreateTaskRequestParams` |
| レスポンス（単一） | `{Action}{Resource}ResponseData` | `GetTaskResponseData` |
| レスポンス（リスト要素） | `{Action}{Resource}ResponseListItem` | `GetTasksResponseListItem` |

### プロパティの型

```typescript
// 文字列
{ name: 'title', type: 'string', required: true }

// メールアドレス（バリデーション付き）
{ name: 'mail', type: 'string', format: 'email', required: true }

// UUID（エンティティID指定必須）
{ name: 'id', type: 'string', format: 'uuid', entityId: 'TaskId', required: true }

// 日時
{ name: 'created_at', type: 'string', format: 'date-time', required: true }

// 区分値
{ name: 'status', type: 'string', kbn: 'task_status', required: true }

// 数値
{ name: 'count', type: 'number', required: true }

// 真偽値
{ name: 'is_active', type: 'boolean', required: true }

// NULL許可
{ name: 'due_at', type: 'string', format: 'date-time', nullable: true }

// バリデーション
{
  name: 'password',
  type: 'string',
  required: true,
  validation: {
    length: { min: 8, max: 128 },
  },
}

// 配列
{
  name: 'tags',
  type: 'array',
  items: { name: 'tag', type: 'string' },
  required: true,
}
```

### サンプル：タスクAPIスキーマ

```typescript
// generator/src/seed/api_schemas/definitions/member_api/task.ts
import type { ApiSchema } from '../../types';

export const taskSchemas = [
  // タスク作成リクエスト
  {
    name: 'CreateTaskRequestParams',
    description: 'タスク作成パラメータ',
    properties: [
      {
        name: 'title',
        type: 'string',
        description: 'タスクタイトル',
        required: true,
        validation: { length: { min: 1, max: 100 } },
        example: 'READMEを更新する',
      },
      {
        name: 'content',
        type: 'string',
        description: 'タスク内容',
        required: false,
        example: 'generatorの使い方を追記',
      },
      {
        name: 'status',
        type: 'string',
        kbn: 'task_status',
        description: 'ステータス',
        required: true,
        example: 'pending',
      },
      {
        name: 'priority',
        type: 'string',
        kbn: 'priority',
        description: '優先度',
        required: true,
        example: 'medium',
      },
      {
        name: 'due_at',
        type: 'string',
        format: 'date-time',
        description: '期限',
        nullable: true,
      },
      {
        name: 'project_id',
        type: 'string',
        format: 'uuid',
        entityId: 'ProjectId',
        description: 'プロジェクトID',
        nullable: true,
      },
    ],
  },

  // タスク詳細レスポンス
  {
    name: 'GetTaskResponseData',
    description: 'タスク詳細レスポンス',
    properties: [
      {
        name: 'id',
        type: 'string',
        format: 'uuid',
        entityId: 'TaskId',
        description: 'タスクID',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'タスクタイトル',
        required: true,
      },
      {
        name: 'content',
        type: 'string',
        description: 'タスク内容',
        nullable: true,
      },
      {
        name: 'status',
        type: 'string',
        kbn: 'task_status',
        description: 'ステータス',
        required: true,
      },
      {
        name: 'priority',
        type: 'string',
        kbn: 'priority',
        description: '優先度',
        required: true,
      },
      {
        name: 'due_at',
        type: 'string',
        format: 'date-time',
        description: '期限',
        nullable: true,
      },
      {
        name: 'created_at',
        type: 'string',
        format: 'date-time',
        description: '作成日時',
        required: true,
      },
    ],
  },

  // タスク一覧レスポンス（リストアイテム）
  {
    name: 'GetTasksResponseListItem',
    description: 'タスク一覧アイテム',
    properties: [
      {
        name: 'id',
        type: 'string',
        format: 'uuid',
        entityId: 'TaskId',
        description: 'タスクID',
        required: true,
      },
      {
        name: 'title',
        type: 'string',
        description: 'タスクタイトル',
        required: true,
      },
      {
        name: 'status',
        type: 'string',
        kbn: 'task_status',
        description: 'ステータス',
        required: true,
      },
      {
        name: 'priority',
        type: 'string',
        kbn: 'priority',
        description: '優先度',
        required: true,
      },
    ],
  },

  // タスク更新リクエスト
  {
    name: 'UpdateTaskRequestParams',
    description: 'タスク更新パラメータ',
    properties: [
      {
        name: 'title',
        type: 'string',
        description: 'タスクタイトル',
        required: true,
        validation: { length: { min: 1, max: 100 } },
      },
      {
        name: 'content',
        type: 'string',
        description: 'タスク内容',
        nullable: true,
      },
      {
        name: 'status',
        type: 'string',
        kbn: 'task_status',
        description: 'ステータス',
        required: true,
      },
      {
        name: 'priority',
        type: 'string',
        kbn: 'priority',
        description: '優先度',
        required: true,
      },
      {
        name: 'due_at',
        type: 'string',
        format: 'date-time',
        description: '期限',
        nullable: true,
      },
    ],
  },
] as const satisfies ApiSchema[];
```

### index.tsへの追加

```typescript
// generator/src/seed/api_schemas/definitions/member_api/index.ts
import { authSchemas } from './auth';
import { userSchemas } from './user';
import { taskSchemas } from './task';  // 追加

export const memberApiSchema = {
  auth: authSchemas,
  user: userSchemas,
  task: taskSchemas,  // 追加
} as const;
```

---

## APIエンドポイントの定義方法

APIのルーティングを定義します。

### ファイル

- 型定義: `generator/src/seed/api_endpoints/types.ts`
- 定義ファイル: `generator/src/seed/api_endpoints/definitions/member_api/` 配下

### エンドポイントグループの構造

```typescript
export interface ApiEndpointGroup {
  name: string;           // グループ名
  basePath: string;       // ベースパス
  description?: string;   // 説明
  endpoints?: ApiEndpoint[];  // このグループのエンドポイント
  subEndpointGroups?: Record<string, ApiEndpointGroup>;  // サブグループ
}
```

### エンドポイントの構造

```typescript
export interface ApiEndpoint {
  path: string;           // パス（グループのbasePathからの相対パス）
  method: HttpMethod;     // GET, POST, PUT, PATCH, DELETE
  operationId: string;    // 操作ID（snake_case推奨）
  summary: string;        // 概要
  description?: string;   // 詳細説明
  tags?: string[];        // タグ
  pathParameters?: ApiPathParameter[];  // パスパラメータ
  queryParameters?: ApiQueryParameters; // クエリパラメータ
  requestBody?: {
    required: boolean;
    schema: string;       // APIスキーマ名
  };
  responses: {
    [statusCode: string]: {
      description: string;
      schema?: MemberResponseBodySchema;
    };
  };
  security?: string[];    // 認証が必要な場合 ['BearerAuth']
}
```

### レスポンススキーマの指定方法

```typescript
// 単一オブジェクトを返す場合
responses: {
  '200': {
    description: '取得成功',
    schema: {
      type: 'data',
      dataSchema: 'GetTaskResponseData',
    },
  },
}

// リストを返す場合
responses: {
  '200': {
    description: '取得成功',
    schema: {
      type: 'list',
      itemSchema: 'GetTasksResponseListItem',
    },
  },
}

// UUIDのみを返す場合
responses: {
  '200': {
    description: '作成成功',
    schema: {
      type: 'uuid',
      entityId: 'TaskId',
    },
  },
}

// レスポンスボディなし
responses: {
  '200': {
    description: '削除成功',
  },
}
```

### サンプル：タスクAPIエンドポイント

```typescript
// generator/src/seed/api_endpoints/definitions/member_api/v1/tasks.ts
import type { ApiEndpointGroup } from '../../../types';

export const tasksEndpoints: ApiEndpointGroup = {
  name: 'tasks',
  basePath: '/tasks',
  description: 'タスク関連のエンドポイント',
  endpoints: [
    // タスク一覧取得
    {
      path: '',
      method: 'GET',
      operationId: 'get_tasks',
      summary: 'タスク一覧取得',
      description: 'ログインユーザーのタスク一覧を取得する',
      tags: ['tasks'],
      responses: {
        '200': {
          description: '取得成功',
          schema: {
            type: 'list',
            itemSchema: 'GetTasksResponseListItem',
          },
        },
      },
      security: ['BearerAuth'],
    },

    // タスク作成
    {
      path: '',
      method: 'POST',
      operationId: 'create_task',
      summary: 'タスク作成',
      description: '新しいタスクを作成する',
      tags: ['tasks'],
      requestBody: {
        required: true,
        schema: 'CreateTaskRequestParams',
      },
      responses: {
        '200': {
          description: '作成成功',
          schema: {
            type: 'uuid',
            entityId: 'TaskId',
          },
        },
        '400': {
          description: 'バリデーションエラー',
        },
      },
      security: ['BearerAuth'],
    },

    // タスク詳細取得
    {
      path: '/{id}',
      method: 'GET',
      operationId: 'get_task',
      summary: 'タスク詳細取得',
      description: '指定したタスクの詳細を取得する',
      tags: ['tasks'],
      pathParameters: [
        {
          name: 'id',
          type: 'string',
          format: 'uuid',
          entityId: 'TaskId',
          description: 'タスクID',
        },
      ],
      responses: {
        '200': {
          description: '取得成功',
          schema: {
            type: 'data',
            dataSchema: 'GetTaskResponseData',
          },
        },
        '404': {
          description: 'タスクが見つからない',
        },
      },
      security: ['BearerAuth'],
    },

    // タスク更新
    {
      path: '/{id}',
      method: 'PUT',
      operationId: 'update_task',
      summary: 'タスク更新',
      description: '指定したタスクを更新する',
      tags: ['tasks'],
      pathParameters: [
        {
          name: 'id',
          type: 'string',
          format: 'uuid',
          entityId: 'TaskId',
          description: 'タスクID',
        },
      ],
      requestBody: {
        required: true,
        schema: 'UpdateTaskRequestParams',
      },
      responses: {
        '200': {
          description: '更新成功',
        },
        '400': {
          description: 'バリデーションエラー',
        },
        '404': {
          description: 'タスクが見つからない',
        },
      },
      security: ['BearerAuth'],
    },

    // タスク削除
    {
      path: '/{id}',
      method: 'DELETE',
      operationId: 'delete_task',
      summary: 'タスク削除',
      description: '指定したタスクを削除する',
      tags: ['tasks'],
      pathParameters: [
        {
          name: 'id',
          type: 'string',
          format: 'uuid',
          entityId: 'TaskId',
          description: 'タスクID',
        },
      ],
      responses: {
        '200': {
          description: '削除成功',
        },
        '404': {
          description: 'タスクが見つからない',
        },
      },
      security: ['BearerAuth'],
    },
  ],
};
```

### index.tsへの追加

```typescript
// generator/src/seed/api_endpoints/definitions/member_api/index.ts
import type { ApiEndpointGroup } from '../../types';
import { authEndpoints } from './auth';
import { mediaEndpoints } from './v1/media';
import { usersEndpoints } from './v1/users';
import { tasksEndpoints } from './v1/tasks';  // 追加

export const memberApiEndpoints = {
  name: 'generated',
  basePath: '/api',
  subEndpointGroups: {
    auth: authEndpoints,
    v1: {
      name: 'v1',
      basePath: '/v1',
      subEndpointGroups: {
        media: mediaEndpoints,
        users: usersEndpoints,
        tasks: tasksEndpoints,  // 追加
      },
    },
  },
} as const satisfies ApiEndpointGroup;
```

---

## 画面定義の方法

フロントエンドの画面情報を定義し、以下を自動生成します：

- 画面遷移図（Mermaid形式のMarkdown）
- 各画面の詳細説明（Markdown）
- EntryPointコンポーネント（Vue）
- Props型定義（TypeScript）

### ファイル

- 型定義・ヘルパー・`PageName`: `generator/src/seed/pages/base.ts`
- 集約・エクスポート・ナビゲーション定義: `generator/src/seed/pages/index.ts`
- ページ定義: `generator/src/seed/pages/definitions/auth.ts`, `problems.ts` など

### 設計方針

ページ属性とナビゲーション定義は分離されています。

- **`PageDef`**: ページ固有の属性（パス、API、パスパラメータなど）。ナビゲーションを含まない
- **`index.ts` の `pageNavigations`**: ページ間の遷移関係。`to` の型は `PageName`（全ページ名のユニオン型）なので、存在しないページ名を指定するとコンパイルエラーになる

### 主要な型

```typescript
// base.ts
export type PageDef = {
  pname: string;          // ページ物理名（PascalCase）例: "Login", "Problems"
  lname?: string;         // ページ論理名（日本語）例: "ログイン画面"
  path: string;           // URLパス 例: "/login", "/problems/:id"
  description?: string;   // 画面の説明
  requiresAuth?: boolean; // 認証が必要か
  apis?: PageApi[];       // 使用するAPI
  pathParams?: PathParam[];     // パスパラメータ
  queryParams?: QueryParam[];   // クエリパラメータ
  children?: PageDef[];         // Vue Router のネストルートとして描画する子ページ
};

export type PageNavigation<TPageName extends string = string> = {
  to: TPageName;          // 遷移先ページ名（PageName ユニオン型で型安全）
  label?: string;         // 遷移リンクのラベル
  condition?: string;     // 遷移条件の説明
};

// base.ts（index.ts の basePages から自動生成）
export type PageName = 'Login' | 'Register' | ...; // 全ページ名のユニオン
```

### サンプル：ページ定義

```typescript
// generator/src/seed/pages/definitions/auth.ts
import { definePageDef, type PageDef } from '../base';

export const authPages = [
  definePageDef({
    pname: 'Login',
    lname: 'ログイン画面',
    path: '/login',
    description: 'ログイン画面。メールアドレスとパスワードでログインを行う。',
    requiresAuth: false,
    apis: [
      { operationId: 'login', description: 'ログイン処理' },
      { operationId: 'get_current_user', description: 'ログイン後のユーザー情報取得' },
    ],
  }),
] as const satisfies readonly PageDef[];
```

### サンプル：パスパラメータを持つページ定義

```typescript
definePageDef({
  pname: 'ProblemDetail',
  lname: '問題詳細画面',
  path: '/problems/:id',
  description: '問題詳細画面。問題の内容確認、解答の送信、評価が行える。',
  requiresAuth: false,
  pathParams: [
    {
      name: 'id',
      type: 'id',
      entityId: 'PublishedProblemId',
      description: '公開済み問題ID',
    },
  ],
  apis: [
    { operationId: 'get_problem', description: '問題詳細取得' },
    { operationId: 'submit_answer', description: '解答送信' },
  ],
}),
```

### ナビゲーションの定義

ナビゲーションは `index.ts` の `pageNavigations` に記述します。
`to` の型は `PageName`（全ページ名のユニオン型）なので補完が効き、存在しないページ名はコンパイルエラーになります。

```typescript
// generator/src/seed/pages/index.ts（pageNavigations の部分）
const pageNavigations: Partial<Record<PageName, PageNavigation<PageName>[]>> = {
  Login: [
    { to: 'Register', label: '新規登録はこちら' },
    { to: 'PasswordReset', label: 'パスワードを忘れた方' },
    { to: 'Home', condition: 'ログイン成功時' },
  ],
  ProblemDetail: [
    { to: 'Problems', label: '一覧に戻る' },
  ],
};
```

### 新しいページを追加する場合

1. 該当の定義ファイル（`auth.ts` または `problems.ts`）に `definePageDef` でページを追加する
2. `base.ts` の `PageName` は自動的に更新される（再生成不要）
3. ナビゲーションが必要であれば `index.ts` の `pageNavigations` に追記する

### 生成物

#### 1. 画面遷移図: `docs/screens/screen-flow.md`

Mermaid形式のフローチャートで画面遷移を可視化します。

#### 2. 各画面のドキュメント: `docs/screens/pages/{page_name}.md`

画面ごとの詳細情報（パス、認証要否、使用API、遷移先など）をMarkdownで出力します。

#### 3. EntryPointコンポーネント: `apps/frontend/src/pages/generated/{PageName}PageEntryPoint.vue`

```vue
<script setup lang="ts">
/**
 * このファイルは generator/src/generators/pages.ts から生成されます。
 * 直接編集しないでください。
 */
import { useApi } from '@/composables/use_api';
import { useRouter } from 'vue-router';
import LoginPage from '@/pages/LoginPage.vue';
import type { LoginPageProps } from './types/login';

const api = useApi();
const router = useRouter();

// API関数
const apis: LoginPageApis = {
  login: api.login,
  getCurrentUser: api.getCurrentUser,
};

// ナビゲーション関数
const navigations: LoginPageNavigations = {
  toRegister: () => router.push({ name: 'Register' }),
  toPasswordReset: () => router.push({ name: 'PasswordReset' }),
  toHome: () => router.push({ name: 'Home' }),
};
</script>

<template>
  <LoginPage :apis="apis" :navigations="navigations" />
</template>
```

#### 4. Props型定義: `apps/frontend/src/pages/generated/types/{pageName}.ts`

```typescript
export type LoginPageApis = {
  /** ログイン処理 */
  login: (...args: unknown[]) => Promise<unknown>;
  /** ログイン後のユーザー情報取得 */
  getCurrentUser: (...args: unknown[]) => Promise<unknown>;
};

export type LoginPageNavigations = {
  /** 新規登録はこちら */
  toRegister: () => void;
  /** パスワードを忘れた方 */
  toPasswordReset: () => void;
  /** ログイン成功時 */
  toHome: () => void;
};

export type LoginPageProps = {
  apis: LoginPageApis;
  navigations: LoginPageNavigations;
};
```

### ユーザーが作成するPageコンポーネントの例

```vue
<script setup lang="ts">
import type { LoginPageProps } from '@/pages/generated/types/login';

const props = defineProps<LoginPageProps>();

// props.apis.login() でAPI呼び出し
// props.navigations.toHome() で画面遷移
</script>

<template>
  <!-- UIの実装 -->
</template>
```

---

## 自動生成方法

定義ファイルを更新したら、以下のコマンドでコードを自動生成します：

```bash
./cli/bin/project-template local generate
```

生成後は必ず型チェックを行ってください：

```bash
# APIの型チェック
./cli/bin/project-template local exec api cargo check
```

---

## 新機能追加の手順

新しい機能（例：タスク管理機能）を追加する場合の手順です。

### 1. エンティティIDの追加

`generator/src/seed/entity_ids/index.ts` に新しいエンティティIDを追加：

```typescript
export const entityIds = ['UserId', 'MediaId', 'TaskId'] as const;
```

### 2. 区分値の追加（必要な場合）

`generator/src/seed/kbns/index.ts` に区分値を追加：

```typescript
{
  id: 'task_status',
  name: 'タスク状態',
  values: [
    { id: 'pending', name: '未着手' },
    { id: 'in_progress', name: '進行中' },
    { id: 'completed', name: '完了' },
  ],
},
```

### 3. テーブル定義の追加

`generator/src/seed/tables/definitions/tasks.ts` を作成し、`index.ts` に登録。

### 4. APIスキーマの追加

`generator/src/seed/api_schemas/definitions/member_api/task.ts` を作成し、`index.ts` に登録。

### 5. APIエンドポイントの追加

`generator/src/seed/api_endpoints/definitions/member_api/v1/tasks.ts` を作成し、`index.ts` に登録。

### 6. コード生成

```bash
./cli/bin/project-template local generate
```

### 7. 型チェック

```bash
./cli/bin/project-template local exec api cargo check
```

### 8. DB初期化

```bash
./cli/bin/project-template local prepare
```

### 9. ハンドラー実装

自動生成された `apps/api/api/src/handler/generated/` 以下のファイルを確認し、
対応するハンドラーを `apps/api/api/src/handler/` に実装します。

---

## よくあるエラーと対処法

### 1. Entity IDエラー

```
型 '"TaskId"' を型 '"UserId" | "MediaId"...' に割り当てることはできません
```

**原因**: `entity_ids/index.ts` にエンティティIDを追加し忘れている

**対処**: `entityIds` 配列に新しいIDを追加

### 2. スキーマ名エラー

```
no `CreateTaskRequest` in `model::generated::tasks`
```

**原因**: スキーマ名のサフィックスが正しくない

**対処**: リクエストパラメータには `RequestParams`、レスポンスには `ResponseData` または `ResponseListItem` のサフィックスを使用

### 3. カラム名エラー

```
no field `user_id` in `tasks` table
```

**原因**: カラム名の指定が正しくない

**対処**: ドメインの `pname` を確認。例えば `domain: 'UUID'` で `pname: 'user'` を指定すると、カラム名は `user_uuid` になる

### 4. 外部キーエラー

```
column "xxx" referenced in foreign key constraint does not exist
```

**原因**: 外部キーで参照しているカラム名が存在しない

**対処**: 外部キー定義の `columns` と `referencedColumns` を確認。カラム名はドメインのサフィックスを含む完全な名前を指定（例: `user_uuid`）
