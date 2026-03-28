import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { getAllColors, TYPOGRAPHY, SPACING, SHAPE, COMPONENT_META } from "@/lib/design-tokens";

// WebテーマからFigmaにインポート可能なトークンJSONを返す

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
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

  return NextResponse.json(tokens, { headers: corsHeaders(req) });
}
