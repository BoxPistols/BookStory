import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { CatalogComponent, Catalog, DesignToken } from "@bookstory/core";

interface RawCatalog {
  generatedAt: string | null;
  componentDir?: string;
  components: CatalogComponent[];
  tokens?: DesignToken[];
}

function readJson(filePath: string): RawCatalog | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function GET() {
  const roots = [process.cwd(), resolve(process.cwd(), "../..")];

  const components: CatalogComponent[] = [];
  const tokens: DesignToken[] = [];
  const seen = new Set<string>();
  let generatedAt: string | null = null;
  let componentDir = "";

  for (const root of roots) {
    // CLIスキャン結果
    const cli = readJson(resolve(root, ".bookstory/catalog.json"));
    if (cli) {
      generatedAt = cli.generatedAt;
      componentDir = cli.componentDir || "";
      for (const c of cli.components) {
        if (!seen.has(c.id)) { seen.add(c.id); components.push(c); }
      }
    }
    // Figmaプラグイン結果
    const figma = readJson(resolve(root, ".bookstory/figma-catalog.json"));
    if (figma) {
      if (!generatedAt || (figma.generatedAt && figma.generatedAt > generatedAt)) {
        generatedAt = figma.generatedAt;
      }
      for (const c of figma.components) {
        const comp = { ...c, category: c.category || "Figma" };
        if (!seen.has(comp.id)) { seen.add(comp.id); components.push(comp); }
      }
      if (figma.tokens) tokens.push(...figma.tokens);
    }
  }

  const catalog: Catalog = { generatedAt, componentDir, components, tokens };
  return NextResponse.json(catalog);
}
