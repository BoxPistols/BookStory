# BookStory

Figma → コード自動変換ツール。デザイナーがターミナルを一切使わずに、FigmaのデザインをReactコンポーネントとして反映できる。

## デプロイ

- **Web UI**: https://bookstory-wine.vercel.app
- **リポジトリ**: https://github.com/BoxPistols/BookStory

## 運用フロー

```
Figma でコンポーネント / バリアブル / スタイルを編集
  ↓
BookStory プラグイン「コンポーネントをスキャン」
  ↓
「コードに反映する」ボタン
  ↓  (自動: GitHub コミット → Vercel ビルド → 約30秒)
  ↓
Web UI に反映（プレビュー / Props操作 / バリアント / コード / ドキュメント）
```

デザイナーの操作は **Figma上のボタン2つ** だけ。GitHub / ターミナル不要。

## Figma ページ構成と運用

### 2ページの役割

| ページ | 何を置くか | 例 |
|--------|-----------|-----|
| **tokens** | バリアント付きコンポーネント + トークン参照表 | Button(27種), Chip(8種), Alert(4種), Switch, Badge |
| **Starter Kit** | 単体コンポーネント | Dialog, Table, Card, Tabs, Stepper, AppBar 等 |

プラグインは**全ページを横断スキャン**するため、どちらに置いても Web に反映される。

### 作業ルール（3つだけ）

1. **コンポーネント名は変えない** — Web側のレンダラーと名前で紐づいている（例: `Button`, `Chip`, `Dialog`）
2. **バリアント名の形式を維持** — `Variant=Contained, Color=Primary, Size=Small` のカンマ区切り形式
3. **編集後に「コードに反映する」を押す** — これだけでWebに反映

### やっていいこと

- コンポーネントのデザイン改善（色・角丸・サイズ・パディング等）
- Description の記入・編集
- 新バリアントの追加
- Variables（カラー・スペーシング）の値変更
- Text Styles の調整
- 新コンポーネントの追加
- レイアウトの整理

### 推奨の作業手順

```
1. Figma でデザイン作業
2. 区切りの良いところで「スキャン」→ 件数確認
3. 「コードに反映する」→ 数分後に Web で確認
```

## ドキュメントの追加方法

Figma のコンポーネント **Description** フィールドに Markdown で記述すると、Web のドキュメントタブに自動反映される。

```
1行目 → サマリー（コンポーネント名の下に表示）
2行目以降 → ドキュメントタブに表示（Markdown対応）
```

### 記述例（Figma の Description 欄）

```
ユーザーのアクションを誘導するためのインタラクション要素。

**バリアント:**
- `contained`: 最も重要なアクション（1画面に1〜2個まで）
- `outlined`: 副次的なアクション、キャンセル
- `text`: テキストリンクに近い軽いアクション

**サイズ:**
- `large`: CTA、ヒーロー
- `medium`: フォーム、ダイアログ
- `small`: テーブル内、ツールバー

**ガイドライン:**
- ラベルは動詞で始める（「保存する」「送信する」）
- disabledの理由をツールチップで表示
```

## Figma プラグインのセットアップ

### インストール

1. Figma → Plugins → Development → Import plugin from manifest...
2. `packages/figma-plugin/manifest.json` を選択

### ビルド

```bash
cd packages/figma-plugin
pnpm build        # 1回ビルド
pnpm dev          # ウォッチモード
```

### 接続先サーバー

プラグイン UI の「接続先サーバー」欄にデプロイ先 URL を入力（デフォルト: `https://bookstory-wine.vercel.app`）

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| Web UI | Next.js 16 + MUI + TypeScript |
| CLI | Node.js（`bookstory scan` / `bookstory dev`） |
| Figma プラグイン | TypeScript + esbuild |
| デプロイ | Vercel（Git 連携で自動ビルド） |
| モノレポ | pnpm workspaces + Turborepo |

## プロジェクト構成

```
apps/
  web/              # Next.js Web UI（ポート 3200）
packages/
  cli/              # CLI ツール
  figma-plugin/     # Figma プラグイン
  core/             # 共有ロジック
.bookstory/
  catalog.json      # CLI スキャン結果
  figma-catalog.json # Figma プラグイン同期結果
```

## 環境変数（Vercel）

| 変数 | 用途 |
|------|------|
| `GITHUB_TOKEN` | GitHub API 認証（Contents read/write 権限） |
| `GITHUB_REPO` | 対象リポジトリ（例: `BoxPistols/BookStory`） |

## 開発

```bash
pnpm install
pnpm dev           # 全パッケージ起動
```
