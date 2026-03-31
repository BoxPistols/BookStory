import { NextResponse } from "next/server";
import type { CatalogComponent, Catalog, DesignToken } from "@bookstory/core";

// prebuildスクリプトでコピーされたデータを直接import（Vercelパス解決問題の回避）
import figmaRaw from "@/data/figma-catalog.json";
import cliRaw from "@/data/catalog.json";

export const dynamic = "force-static";

interface RawCatalog {
  generatedAt: string | null;
  componentDir?: string;
  components: CatalogComponent[];
  tokens?: DesignToken[];
}

export async function GET() {
  const components: CatalogComponent[] = [];
  const tokens: DesignToken[] = [];
  const seen = new Set<string>();
  let generatedAt: string | null = null;
  let componentDir = "";

  // CLIスキャン結果
  const cli = cliRaw as unknown as RawCatalog | null;
  if (cli?.components) {
    generatedAt = cli.generatedAt ?? null;
    componentDir = cli.componentDir || "";
    for (const c of cli.components) {
      if (!seen.has(c.id)) { seen.add(c.id); components.push(c); }
    }
  }

  // Figmaプラグイン結果
  const figma = figmaRaw as unknown as RawCatalog | null;
  if (figma?.components) {
    if (!generatedAt || (figma.generatedAt && figma.generatedAt > generatedAt)) {
      generatedAt = figma.generatedAt;
    }
    for (const c of figma.components) {
      const comp = { ...c, category: c.category || "Figma" };
      if (!seen.has(comp.id)) { seen.add(comp.id); components.push(comp); }
    }
    if (figma.tokens) tokens.push(...figma.tokens);
  }

  const catalog: Catalog = { generatedAt, componentDir, components, tokens };
  return NextResponse.json(catalog);
}
