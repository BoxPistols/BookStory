// デザイントークン Single Source of Truth
// theme.ts（MUI）と export/route.ts（Figma同期）の両方から参照

// --- カラートークン ---
export const COLORS = {
  light: {
    "Brand/Primary": "#2642be",
    "Brand/Primary Light": "#5c6fd6",
    "Brand/Primary Dark": "#1a2c80",
    "Brand/Secondary": "#696881",
    "Semantic/Success": "#46ab4a",
    "Semantic/Warning": "#eb8117",
    "Semantic/Error": "#da3737",
    "Semantic/Info": "#1dafc2",
    "Surface/Background": "#faf8fc",
    "Surface/Paper": "#ffffff",
    "Surface/Text Primary": "#2d1f4e",
    "Surface/Text Secondary": "#5c4d7a",
    "Surface/Divider": "#e8e0f0",
  },
  dark: {
    "Brand/Primary": "#5c6fd6",
    "Brand/Primary Light": "#8b9be8",
    "Brand/Primary Dark": "#2642be",
    "Brand/Secondary": "#8b8aaa",
    "Semantic/Success": "#5bc45f",
    "Semantic/Warning": "#f5a623",
    "Semantic/Error": "#f87171",
    "Semantic/Info": "#38d1e5",
    "Surface/Background": "#0f0d1a",
    "Surface/Paper": "#1a1726",
    "Surface/Text Primary": "#e8e0f0",
    "Surface/Text Secondary": "#9b8fbf",
    "Surface/Divider": "#2d2640",
  },
} as const;

export const GREY_SCALE: Record<string, string> = {
  "Grey/50": "#fafafa",
  "Grey/100": "#f5f5f5",
  "Grey/200": "#eeeeee",
  "Grey/300": "#e0e0e0",
  "Grey/400": "#bdbdbd",
  "Grey/500": "#9e9e9e",
  "Grey/600": "#757575",
  "Grey/700": "#616161",
  "Grey/800": "#424242",
  "Grey/900": "#212121",
};

// --- タイポグラフィトークン ---
interface TypographyToken {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const TYPOGRAPHY: Record<string, TypographyToken> = {
  "Heading/Display Large": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 32, lineHeight: 1.2 },
  "Heading/Display Medium": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 28, lineHeight: 1.2 },
  "Heading/Display Small": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 24, lineHeight: 1.2 },
  "Heading/H1": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 22, lineHeight: 1.3 },
  "Heading/H2": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 20, lineHeight: 1.3 },
  "Heading/H3": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 18, lineHeight: 1.35 },
  "Heading/H4": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 16, lineHeight: 1.4 },
  "Heading/H5": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 14, lineHeight: 1.4 },
  "Heading/H6": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 12, lineHeight: 1.4 },
  "Body/Body 1": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 14, lineHeight: 1.65 },
  "Body/Body 2": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 12, lineHeight: 1.6 },
  "Body/Caption": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 12, lineHeight: 1.4 },
  "Body/Overline": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 12, lineHeight: 1.4, letterSpacing: 1 },
  "Body/Button": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 14, lineHeight: 1.4 },
  "Scale/XXL": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 22, lineHeight: 1.3 },
  "Scale/XL": { fontFamily: "Inter", fontWeight: "Bold", fontSize: 20, lineHeight: 1.3 },
  "Scale/LG": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 18, lineHeight: 1.35 },
  "Scale/ML": { fontFamily: "Inter", fontWeight: "SemiBold", fontSize: 16, lineHeight: 1.4 },
  "Scale/MD": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 14, lineHeight: 1.5 },
  "Scale/SM": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 12, lineHeight: 1.5 },
  "Scale/XS": { fontFamily: "Inter", fontWeight: "Regular", fontSize: 10, lineHeight: 1.4 },
};

// --- スペーシング ---
export const SPACING = {
  base: 4,
  values: [4, 8, 12, 16, 24, 32, 48, 64, 96],
} as const;

// --- シェイプ ---
export const SHAPE = {
  borderRadius: 8,
} as const;

// --- MUI palette 変換ヘルパー ---
type Mode = "light" | "dark";

export function toMuiPalette(mode: Mode) {
  const c = COLORS[mode];
  return {
    mode,
    primary: { main: c["Brand/Primary"], light: c["Brand/Primary Light"], dark: c["Brand/Primary Dark"] },
    secondary: { main: c["Brand/Secondary"] },
    success: { main: c["Semantic/Success"] },
    warning: { main: c["Semantic/Warning"] },
    error: { main: c["Semantic/Error"] },
    info: { main: c["Semantic/Info"] },
    background: { default: c["Surface/Background"], paper: c["Surface/Paper"] },
    text: { primary: c["Surface/Text Primary"], secondary: c["Surface/Text Secondary"] },
    divider: c["Surface/Divider"],
  };
}

// --- Figma export 用の全カラー統合 ---
export function getAllColors(mode: Mode): Record<string, string> {
  return { ...COLORS[mode], ...GREY_SCALE };
}

// --- コンポーネントメタデータ（Web↔Figma同期用） ---
interface ComponentMeta {
  name: string;
  description: string;
  category: "input" | "display" | "navigation" | "feedback" | "layout" | "surface";
  variants?: string[];
}

export const COMPONENT_META: ComponentMeta[] = [
  { name: "Button", description: "基本ボタン。Contained/Outlined/Text バリアント", category: "input", variants: ["variant", "color", "size"] },
  { name: "TextField", description: "テキスト入力フィールド。フォームの基本入力要素", category: "input", variants: ["variant", "size"] },
  { name: "Checkbox", description: "チェックボックス。複数選択のフォーム入力", category: "input" },
  { name: "Radio", description: "ラジオボタン。排他選択のフォーム入力", category: "input" },
  { name: "Switch", description: "トグルスイッチ。On/Off の状態切り替え", category: "input", variants: ["state", "size"] },
  { name: "Slider", description: "スライダー。範囲内の値を連続的に調整", category: "input" },
  { name: "Rating", description: "星レーティング。5段階評価", category: "input" },
  { name: "Chip", description: "チップ。タグやフィルターに使用", category: "display", variants: ["variant", "color"] },
  { name: "Alert", description: "アラート。Success/Warning/Error/Info のフィードバック", category: "feedback", variants: ["severity"] },
  { name: "Badge", description: "バッジ。アイコン右上にカウンターやステータスを表示", category: "display", variants: ["color", "size"] },
  { name: "Avatar", description: "アバター。ユーザー画像やイニシャルを表示", category: "display" },
  { name: "Tooltip", description: "ツールチップ。ホバー時に補足情報を表示", category: "display" },
  { name: "Skeleton", description: "スケルトン。コンテンツ読み込み中のプレースホルダー", category: "feedback" },
  { name: "Card", description: "カード。画像・テキスト・アクションをグループ化", category: "surface" },
  { name: "Divider", description: "区切り線。コンテンツ間のセパレーター", category: "layout" },
  { name: "IconButton", description: "アイコンのみのボタン。ツールバーやコンパクトUIに使用", category: "input" },
  { name: "Fab", description: "フローティングアクションボタン。主要アクションを強調", category: "input" },
  { name: "LinearProgress", description: "線形プログレスバー。処理の進捗を表示", category: "feedback" },
  { name: "CircularProgress", description: "円形プログレス。読み込み状態を表示", category: "feedback" },
  { name: "Breadcrumbs", description: "パンくずリスト。ナビゲーション階層を表示", category: "navigation" },
  { name: "Pagination", description: "ページネーション。ページ送りナビゲーション", category: "navigation" },
  { name: "Dialog", description: "ダイアログ。確認やフォーム入力のモーダル", category: "surface" },
  { name: "Drawer", description: "ドロワー。サイドメニューやナビゲーションパネル", category: "surface" },
  { name: "Snackbar", description: "スナックバー。一時的な通知メッセージ", category: "feedback" },
  { name: "Tabs", description: "タブ。コンテンツの切り替えナビゲーション", category: "navigation" },
  { name: "Stepper", description: "ステッパー。マルチステップフローの進行表示", category: "navigation" },
  { name: "Accordion", description: "アコーディオン。折りたたみ可能なコンテンツセクション", category: "surface" },
  { name: "AppBar", description: "アプリバー。ページ上部のナビゲーションバー", category: "navigation" },
  { name: "Table", description: "テーブル。データの表形式表示", category: "display" },
];
