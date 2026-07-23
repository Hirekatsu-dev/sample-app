---
name: frontend-development
description: Vue 3 + TypeScript + Tailwind CSSのフロントエンド開発規約。コンポーネント構造、Composables、フォームバリデーション、スタイリングのパターン。フロントエンドのコードを書く・修正するときに参照する。
user-invocable: false
---

# フロントエンド開発規約

Vue 3 + TypeScript + Tailwind CSS v4 のフロントエンドの開発規約。

## コンポーネント構成

### ページコンポーネント
- `src/pages/generated/*EntryPoint.vue` — 自動生成。ルーティングコンテキスト（navigations等）を提供
- `src/pages/inner/*Page.vue` — 手動実装。EntryPointからcontextをpropsで受け取る

### UIコンポーネント（Kt*）
`src/components/ui/` に配置。すべて `Kt` プレフィックス。

利用可能: KtButton, KtCard, KtFileUploader, KtFormItem, KtIcon, KtIconButton, KtLatexEditor, KtLatexEditorWithPreview, KtLatexPreview, KtPagination, KtTable, KtTableCell, KtTableHeaderCell, KtTableRow, KtTextInput, KtTextarea, KtToast, KtToastContainer, KtDialogContainer

## 必須パターン

### script setup + TypeScript
```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}
const props = withDefaults(defineProps<Props>(), { count: 0 });
</script>
```

### Composables
| composable | 用途 | 使用例 |
|------------|------|--------|
| `useApi()` | API呼び出し | `const api = useApi(); await api.getProblems({...})` |
| `useMe()` | ログインユーザー情報 | `const { me, setMe, resetMe } = useMe()` |
| `useDialog()` | ダイアログ表示 | `const { confirm, alert, confirmDelete } = useDialog()` |
| `useToastMessages()` | トースト通知 | `const { addSuccess, addError } = useToastMessages()` |
| `useGlobalLoading()` | ローディング状態 | `await withLoading(async () => { ... })` |
| `useGlobalHeaderTab()` | ヘッダータブ | `setGlobalHeaderTab('solve')` |

### フォームバリデーション
Form基底クラス + Zodスキーマで実装。

```typescript
// forms/example.ts
import { z as zod } from 'zod';
import { Form } from '@/forms';

type Fields = { name: string; mail: string };

const schema = zod.object({
  name: zod.string().min(1, '名前を入力してください'),
  mail: zod.string().email(),
});

export class ExampleForm extends Form<Fields, RequestParams> {
  constructor(public fields: Fields) { super(schema); }
  toParams() { return this.fields; }
}
```

使用側: `form.value.validate()` でバリデーション実行、`form.validationErrors.fields.name` でエラー取得。

### ナビゲーション
```typescript
import router from '@/router';
import { Routes } from '@/router/routes';
await router.push({ name: Routes.ProblemDetail, params: { id: '123' } });
```

### スタイリング
- Tailwind CSS v4 のユーティリティクラスを使用
- 動的クラスは `computed` で生成
- カスタムテーマ色: `--color-primary`, `--color-secondary`, `--color-success`, `--color-error`
- 必要に応じて `<style lang="scss" scoped>` を使用

### i18n
```typescript
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// t('validation.required', { name: t('login.field.email') })
```
翻訳ファイル: `src/locale/ja.json`

### Modelクラス
```typescript
export class Me extends Model {
  static fromApiResponse(data: GetMeResponseData) {
    return new Me(data.id, data.name, data.email);
  }
}
```

### エラーハンドリング
- App.vueの`onErrorCaptured`でグローバルキャプチャ → トースト表示
- ページ固有のエラーはtry-catchで処理
- `ApiError`クラスで`statusCode`/`resultCode`を構造化

### Storybook
UIコンポーネントにはStorybookストーリーを作成する。`*.stories.ts` ファイルで定義。

## 自動生成ファイル（直接編集禁止）
- `src/api/generated_api.ts` — APIクライアント
- `src/api/schemas/generated/*.ts` — API型定義
- `src/router/generated/routes.ts` — ルート定義
- `src/pages/generated/*EntryPoint.vue` — EntryPoint
- `src/kbn.ts` — 区分値
- `src/error_code.ts` — エラーコード
