import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export async function GET() {
  // プロジェクトルートから .bookstory/catalog.json を探す
  const candidates = [
    resolve(process.cwd(), ".bookstory/catalog.json"),
    resolve(process.cwd(), "../../.bookstory/catalog.json"),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      const data = JSON.parse(readFileSync(path, "utf-8"));
      return NextResponse.json(data);
    }
  }

  return NextResponse.json({ components: [], generatedAt: null }, { status: 200 });
}
