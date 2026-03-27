import { NextResponse } from "next/server";

// WebテーマからFigmaにインポート可能なトークンJSONを返す
// CORSヘッダー付き（Figmaプラグインから直接fetch可能）

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  // theme.ts + MUI標準トークンの完全エクスポート
  const tokens = {
    colors: {
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
      },
    },
    typography: {
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
    },
    spacing: {
      base: 4,
      values: [4, 8, 12, 16, 24, 32, 48, 64, 96],
    },
    shape: {
      borderRadius: 8,
    },
  };

  return NextResponse.json(tokens, { headers: CORS_HEADERS });
}
