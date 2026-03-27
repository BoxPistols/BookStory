# BookStory 仕様書

## 1. コンセプト

BookStory は **Figma = Single Source of Truth** のコンポーネントカタログツール。
デザイナーが Figma でコンポーネントを作成・編集するだけで、Web カタログに自動反映される。
ターミナルや GitHub の操作は不要。

## 2. 全体構成

```
┌─────────────┐     プラグイン      ┌──────────────┐     自動デプロイ     ┌──────────────┐
│   Figma     │ ──「コードに反映」──→ │  GitHub      │ ───Vercel Git───→ │  Web カタログ │
│  (デザイン)  │ ←─「Webを取り込む」── │  (figma-     │                   │  (閲覧専用)  │
│             │      トークン同期     │   catalog)   │                   │              │
└─────────────┘                     └──────────────┘                   └──────────────┘
```

### 各システムの役割

| システム | 役割 | URL |
|---------|------|-----|
| **Figma** | コンポーネント設計・トークン定義 | [Plugin-Test](https://www.figma.com/design/45LRiJPmDqWsz3CUbHIo5Y/Plugin-Test) |
| **Web カタログ** | コンポーネント一覧の閲覧 | https://bookstory-wine.vercel.app |
| **GitHub** | データ保管・自動デプロイトリガー | BoxPistols/BookStory |

## 3. Figma ファイル構成

### ページ一覧

| ページ | 目的 | 内容 |
|--------|------|------|
| **tokens** (node-id=20-2) | バリアント付きコンポーネント + トークン参照 | Button(27), Chip(8), Alert(4), Badge(6), Switch(4), Divider + Typography/Color表示 |
| **Starter Kit** (node-id=55-2) | 単体コンポーネント | IconButton, Fab, Checkbox, Radio, Slider, Rating, TextField, Avatar, Tooltip, Skeleton, CircularProgress, Breadcrumbs, Pagination, Dialog, Drawer, Snackbar, Tabs, Stepper, Accordion, AppBar, Table, Card, LinearProgress |
| **test** | テスト用（運用対象外） | - |

### どちらがメインか？

**両方がメイン。** プラグインは全ページを横断スキャンする。

- **tokens ページ**: バリアント（色×サイズ等の組み合わせ）を持つコンポーネントの定義場所
- **Starter Kit ページ**: バリアントなしの単体コンポーネントの定義場所

→ Web カタログには**両ページのコンポーネントが統合表示**される。

### Variables（バリアブル）

| コレクション | 内容 | モード |
|-------------|------|--------|
| **Color** | 23色（Brand 4, Semantic 4, Surface 5, Grey 10） | Light / Dark |
| **Spacing** | 9値（4, 8, 12, 16, 24, 32, 48, 64, 96） | 単一 |

### Text Styles

21スタイル（Heading 9, Body 5, Scale 7）

## 4. Web カタログの表示内容

サイドバーの構成（bookstory-wine.vercel.app）:

```
TOKENS
├── Color      ← Figma の Color Variables から取得
├── Typography ← Figma の Text Styles から取得
└── Spacing    ← Figma の Spacing Variables から取得

COMPONENTS
├── Button     ← tokens ページのコンポーネントセット
├── Chip
├── Alert
├── Badge
├── Switch
├── Divider
├── IconButton ← Starter Kit ページのコンポーネント
├── Fab
├── Checkbox
├── ...（以下28コンポーネント）
```

**Web カタログ = Figma の内容のミラー。** Figma で変更 → 反映ボタン → Web に表示。

## 5. デザイナーの運用フロー

### 日常作業: コンポーネントの追加・変更

```
1. Figma でコンポーネントを作成/編集
   - tokens ページ: バリアント付き（Button等）
   - Starter Kit ページ: 単体コンポーネント

2. BookStory プラグインを開く
   - 「コンポーネントをスキャン」→ 検出数を確認

3. 「コードに反映する」をクリック
   - → GitHub に自動コミット → Vercel が自動ビルド
   - → 数分で Web カタログに反映

4. Web カタログで確認
   - https://bookstory-wine.vercel.app
```

### トークン変更の同期

```
■ Figma → Web（自動）
  Figma の Variables/Styles を変更 → 「コードに反映する」→ Web に反映

■ Web → Figma
  エンジニアがコード側でカラーを変更した場合:
  「Webを取り込む」→ Figma Variables/Text Styles が更新される
```

### 新しいコンポーネントを追加するには

1. **Figma**: tokens ページまたは Starter Kit ページにコンポーネントを作成
2. **名前**: MUI のコンポーネント名と一致させる（例: `Select`, `Menu`）
3. **Description**: コンポーネントの説明を入力（Web カタログに表示される）
4. **「コードに反映する」** をクリック

### やらなくていいこと

- GitHub を見る
- ターミナルを使う
- コードを書く
- Vercel の設定をする

## 6. データフロー詳細

### 「コードに反映する」（Figma → Web）

```
Figma プラグイン
  ↓ scanComponents() — 全ページからコンポーネント名・バリアント・Description を取得
  ↓ scanTokens()     — Variables + Text Styles + Effect Styles を取得
  ↓ POST /api/publish — JSON送信
  ↓
GitHub API
  ↓ ブランチ作成 → figma-catalog.json コミット → main にマージ → ブランチ削除
  ↓
Vercel
  ↓ main push 検知 → 自動ビルド → デプロイ
  ↓
Web カタログ更新
```

### 「Webを取り込む」（Web → Figma）

```
Figma プラグイン
  ↓ GET /api/export — Web 側のトークン + コンポーネントメタデータ取得
  ↓
Figma に書き込み:
  ├── Color Variables（23色 × Light/Dark）
  ├── Spacing Variables（9値）
  ├── Typography Text Styles（21スタイル）
  └── Component Descriptions（29件）
```

## 7. 現在の課題と制限

| 課題 | 状態 | 説明 |
|------|------|------|
| Starter Kit レイアウト | 未整理 | コンポーネントの配置がばらけている。整列が必要 |
| Web→Figma の視覚的フィードバック | 改善中 | 「取り込みました」と表示するが、既に同じ値の場合変化が見えない |
| コンポーネントの視覚品質 | 改善余地あり | Figma 上のコンポーネントは MUI のたたき台レベル。デザイナーが調整する前提 |
| Web→Figma コンポーネント同期 | トークンのみ | コンポーネント自体の逆方向作成は未対応（Description のみ同期） |

## 8. ファイル構成（開発者向け）

```
BookStory/
├── apps/web/                      # Web カタログ (Next.js)
│   ├── src/lib/design-tokens.ts   # トークン Single Source of Truth
│   ├── src/lib/theme.ts           # MUI テーマ（design-tokens から生成）
│   ├── src/app/api/publish/       # Figma → GitHub 中継
│   ├── src/app/api/export/        # Web → Figma トークン提供
│   └── src/app/api/catalog/       # カタログ JSON 提供
├── packages/figma-plugin/         # Figma プラグイン
│   ├── src/code.ts                # プラグインロジック
│   ├── build.mjs                  # ビルド + UI HTML
│   └── manifest.json              # プラグイン設定
└── .bookstory/
    └── figma-catalog.json         # Figma スキャン結果（自動生成）
```
