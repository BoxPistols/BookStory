import { NextRequest, NextResponse } from "next/server";
import { getAllColors, TYPOGRAPHY, SPACING, SHAPE, COMPONENT_META } from "@/lib/design-tokens";

// WebテーマからFigmaにインポート可能なトークンJSONを返す

const ALLOWED_ORIGIN = process.env.BOOKSTORY_ALLOWED_ORIGIN || "https://*.vercel.app";

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const pattern = ALLOWED_ORIGIN.replace("*", ".*");
  const allowed = new RegExp(`^${pattern}$`).test(origin) || origin === "";
  return {
    "Access-Control-Allow-Origin": allowed ? origin || "*" : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

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
