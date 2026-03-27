import { NextResponse } from "next/server";
import { getAllColors, TYPOGRAPHY, SPACING, SHAPE, COMPONENT_META } from "@/lib/design-tokens";

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
  // design-tokens.ts から自動生成（ハードコード二重管理なし）
  const tokens = {
    colors: {
      light: getAllColors("light"),
      dark: getAllColors("dark"),
    },
    typography: TYPOGRAPHY,
    spacing: SPACING,
    shape: SHAPE,
    components: COMPONENT_META,
  };

  return NextResponse.json(tokens, { headers: CORS_HEADERS });
}
