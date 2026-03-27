# BookStory 仕様書 v2

## 1. コンセプト

デザイナーが Figma で MUI コンポーネントをカスタマイズし、
それがブラウザ上でどのように見えるかを **完全再現** するツール。
Storybook の代替。デザイナーは React を一切知る必要がない。

### ゴール

**オープンソースとして配布可能なレベルの品質・透明性**

### 原則

- **Figma = Single Source of Truth**: デザイナーは Figma だけを見る
- **MUI が制約**: コンポーネントは MUI 上に存在するものが対象
- **デザイントークンは MUI の法則性に準拠**: palette, typography, spacing
- **Props パターンは MUI と一致**: variant, color, size, severity 等
- **拡張は明示的に**: MUI 標準にない Props やパターンは「拡張」と明記
- **静的コードによる透明性**: 複雑な抽象化を避け、読める・追えるコードで構成
- **日本の SaaS 開発標準**: ベースフォント 14px、ダークモード対応

## 2. 関係者の役割

| 役割 | 何をするか | 何を見るか |
|------|-----------|-----------|
| **デザイナー** | Figma で MUI コンポーネントをカスタマイズ | Figma + Web プレビュー |
| **エンジニア** | Web プレビューを見て MUI で実装 | Web プレビュー + Props 仕様 |
| **BookStory** | Figma → Web を自動同期 | — |

### デザイナーに見えるもの

- ブラウザ上の見た目（Figma デザインの完全再現）
- トークン一覧（Color / Typography / Spacing）
- バリアント比較（MUI Props パターン）

### デザイナーに見えなくてよいもの

- React コード / import 文
- Props パネル（エンジニア向け）
- ComponentRenderer の実装

## 3. MUI Props パターンの運用

### Figma バリアント名 = MUI Props

```
Figma コンポーネント名: Button
Figma バリアント:
  Variant=Contained, Color=Primary, Size=Medium
  Variant=Outlined, Color=Error, Size=Small
  ...
       ↓ 自動マッピング ↓
MUI Props:
  <Button variant="contained" color="primary" size="medium" />
```

### MUI 標準 Props の範囲

| コンポーネント | MUI 標準 Props | 例 |
|--------------|---------------|-----|
| Button | variant, color, size, disabled | contained/outlined/text × primary/secondary/error × small/medium/large |
| Alert | severity, variant | success/warning/error/info × standard/filled/outlined |
| Chip | variant, color, size | filled/outlined × primary/secondary/success/error |
| Switch | checked, size, disabled | on/off × small/medium |
| Badge | color, variant | primary/error/success × standard/dot |

### 拡張パターン

MUI 標準にないパターンを追加する場合:

```
Figma バリアント名に [拡張] プレフィックスを付ける:
  [拡張] HasTitle=true     ← MUI Alert のタイトル付きパターン
  [拡張] HasClose=true     ← 閉じるボタン付きパターン
```

これにより Web 側で「MUI 標準」か「独自拡張」かが明確になる。

## 4. 全体構成

```
┌─────────────────┐
│     Figma       │
│  (デザイナー)    │
│                 │
│  Components     │  ← MUI コンポーネントをカスタマイズ
│  Variables      │  ← デザイントークン定義
│  Text Styles    │  ← タイポグラフィ定義
└────────┬────────┘
         │ BookStory プラグイン
         │  「コードに反映する」
         ▼
┌─────────────────┐
│   GitHub        │  ← figma-catalog.json（自動コミット）
└────────┬────────┘
         │ Vercel 自動デプロイ
         ▼
┌─────────────────┐
│  Web カタログ    │
│  (ブラウザ)      │
│                 │
│  完全再現       │  ← Figma と同じ見た目
│  プレビュー      │
│  トークン一覧   │
│  バリアント比較  │
└─────────────────┘
```

## 5. デザイナーの作業フロー

```
1. Figma で MUI コンポーネントをデザイン
   - Variables でカラートークンを定義
   - Text Styles でタイポグラフィを定義
   - コンポーネントにバリアントを追加（MUI Props 命名規則に従う）

2. Description に仕様を記述
   - 用途、ガイドライン、禁止事項

3. プラグインで「コードに反映する」

4. Web カタログで確認
   - ブラウザ上の見え方を確認
   - トークンが正しく反映されているか確認
   - バリアントが揃っているか確認

5. 問題があれば Figma で修正 → 再度反映
```

### 作業ルール

1. **コンポーネント名 = MUI コンポーネント名**（Button, Alert, Chip 等）
2. **バリアント名 = MUI Props 名**（Variant=Contained, Color=Primary 等）
3. **拡張は [拡張] プレフィックスで明示**
4. **Variables の命名は MUI トークン体系に準拠**（Brand/Primary, Semantic/Success 等）

## 6. 完全再現の実装方針

### 目標

Figma で作ったコンポーネントが Web で **ピクセル単位で一致** すること。

### 方法

Figma Plugin API でコンポーネントの全ノードツリーを走査し、
各ノードの視覚プロパティを抽出して HTML/CSS に変換する。

```
Figma Node Tree
├── Frame (Auto Layout: horizontal, gap: 8, padding: 12 16)
│   ├── Icon (fill: #2642be, size: 20x20)
│   └── Text ("ボタン", Inter Semi Bold 14px, fill: #ffffff)
│
    ↓ 変換 ↓

<div style="display:flex; gap:8px; padding:12px 16px;">
  <svg width="20" height="20" fill="#2642be">...</svg>
  <span style="font:600 14px Inter; color:#fff;">ボタン</span>
</div>
```

### Figma → CSS 変換ルール

| Figma | CSS |
|-------|-----|
| Auto Layout (horizontal) | `display: flex; flex-direction: row;` |
| Auto Layout (vertical) | `display: flex; flex-direction: column;` |
| itemSpacing | `gap` |
| padding | `padding` |
| Fill (SOLID) | `background-color` |
| Fill (GRADIENT) | `linear-gradient(...)` |
| Stroke | `border` |
| Corner Radius | `border-radius` |
| Drop Shadow | `box-shadow` |
| Text | `font-family`, `font-size`, `font-weight`, `color` |
| Hug contents | `width: auto` |
| Fill container | `flex: 1` |
| Fixed size | `width: Npx` |
| Opacity | `opacity` |
| Clip content | `overflow: hidden` |

## 7. 現在の課題

| 課題 | 優先度 | 説明 |
|------|--------|------|
| Figma→CSS 完全再現レンダラー | 高 | 現在の ComponentRenderer を置き換える |
| Figma コンポーネント品質 | 高 | 現状は「たたき台」。MUI 準拠のデザインが必要 |
| バリアント画像書き出し | 中 | 各バリアントの Figma 見た目を Web に表示 |
| [拡張] マーキング機能 | 中 | MUI 標準外の Props を検知・表示 |
| レスポンシブプレビュー | 低 | 異なる画面幅での表示確認 |

## 8. ファイル構成

```
BookStory/
├── apps/web/                        # Web カタログ
│   ├── src/lib/design-tokens.ts     # トークン Single Source of Truth
│   ├── src/lib/theme.ts             # MUI テーマ（design-tokens から生成）
│   ├── src/app/api/publish/         # Figma → GitHub 中継
│   ├── src/app/api/export/          # Web → Figma トークン提供
│   └── src/app/api/catalog/         # カタログ JSON 提供
├── packages/figma-plugin/           # Figma プラグイン
│   ├── src/code.ts                  # スキャン + ノードツリー抽出
│   ├── build.mjs                    # ビルド + UI HTML
│   └── manifest.json
├── docs/
│   └── SPEC.md                      # この仕様書
└── .bookstory/
    └── figma-catalog.json           # Figma スキャン結果（自動生成）
```
