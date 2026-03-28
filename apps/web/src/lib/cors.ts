import { NextRequest } from "next/server";

const ALLOWED_ORIGIN = process.env.BOOKSTORY_ALLOWED_ORIGIN || "https://*.vercel.app";

/**
 * CORS ヘッダーを生成する共通ユーティリティ
 * ドットを正しくエスケープし、* を安全なサブドメインパターンに変換
 */
export function corsHeaders(req: NextRequest, methods: string = "GET, OPTIONS") {
  const origin = req.headers.get("origin") || "";
  // 正規表現特殊文字をエスケープ後、\* を [a-zA-Z0-9-]+ に変換
  const escaped = ALLOWED_ORIGIN.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("\\*", "[a-zA-Z0-9-]+");
  const allowed = origin !== "" && new RegExp(`^${escaped}$`).test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
