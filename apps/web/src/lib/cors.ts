import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = (process.env.BOOKSTORY_ALLOWED_ORIGIN || "https://*.vercel.app")
  .split(",")
  .map((s) => s.trim());

/**
 * オリジンがパターンに一致するか判定（* はサブドメインワイルドカード）
 * 正規表現を構築せず、文字列分割で安全にマッチング
 */
function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGINS.some((pattern) => {
    if (!pattern.includes("*")) return origin === pattern;
    // "https://*.vercel.app" → prefix="https://", suffix=".vercel.app"
    const [prefix, suffix] = pattern.split("*", 2);
    if (!origin.startsWith(prefix) || !origin.endsWith(suffix)) return false;
    const middle = origin.slice(prefix.length, origin.length - suffix.length);
    return middle.length > 0 && /^[a-zA-Z0-9-]+$/.test(middle);
  });
}

/**
 * CORS ヘッダーを生成する共通ユーティリティ
 */
export function corsHeaders(req: NextRequest, methods: string = "GET, OPTIONS") {
  const origin = req.headers.get("origin") || "";
  const allowed = origin !== "" && isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
