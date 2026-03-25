import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// GitHub Pages静的エクスポート対応
export const dynamic = "force-static";

export async function GET() {
  // プロジェクトルートから .bookstory/catalog.json を探す
  const candidates = [
    resolve(process.cwd(), ".bookstory/catalog.json"),
    resolve(process.cwd(), "../../.bookstory/catalog.json"),
  ];

  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      const data = JSON.parse(readFileSync(filePath, "utf-8"));
      return NextResponse.json(data);
    }
  }

  return NextResponse.json({ components: [], generatedAt: null }, { status: 200 });
}
