# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## デザイン

トークンは `src/tailwind.css` の `@theme` に定義している。方向性は **検査票（Inspection Sheet）**。テストケースを書き、実行し、合否を記録する道具として設計している。

| | 値 | 意図 |
| --- | --- | --- |
| 地色 | `#f7f8f9`（ほぼ無彩） | 判定色を濁らせないため。彩度のある地色は合格の緑と不合格の赤の判別を鈍らせる |
| インク | `#1c2024` | |
| アクセント | インディゴ `#3b4ab5` | 緑・赤・琥珀を結果の区分に使い切っているため、操作の色はそこから離す |
| 判定色 | 合格 `#12715a` / 不合格 `#c0322b` / ブロック `#a8620a` / スキップ `text-ink-muted` | テスト結果の区分にそのまま対応させる |
| 書体 | Public Sans / JetBrains Mono | 規格文書の硬質なサンセリフと、ID・日時・差分のための等幅 |
| 角丸・影 | `--radius-*` `--shadow-*` を抑制 | 記入用紙は浮かない。面の分離は罫線で行う |

### 判定印（`.stamp`）

この画面を象徴する唯一の装飾。合否を塗りつぶしの色面ではなく枠付きの印で示す。一覧に判定が並んだとき、色面だと画面が色で埋まって個々の判定を拾いにくくなるため、面積を抑えて輪郭と文字で伝える。

色は文字色から継承するので、状態に応じたクラスと併用する。

```html
<span class="stamp text-success">PASS</span>
<span class="stamp text-error">FAIL</span>
```

装飾はこの判定印だけに絞り、他は罫線と余白で構成する。

管理画面（`apps/admin_frontend`）は別のトークンを使う。操作している画面がどちらなのかを一目で判別できるようにするため、見た目の差は意図的なもの。

### 未整理の箇所

`KtTable*` / `KtPagination` / `KtDialogContainer` / `KtTextarea` / `KtIconButton` / `KtToast` は Tailwind 既定の `gray-*` `blue-*` を直接使っており、トークンの差し替えが効かない。いずれも現在どの画面でも使っていないため実害は出ていないが、一覧画面（テストケース一覧など）を作る際にトークンへ寄せる必要がある。
