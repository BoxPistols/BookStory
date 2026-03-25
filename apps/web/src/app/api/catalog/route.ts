import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// GitHub Pages静的エクスポート対応
export const dynamic = "force-static";

interface CatalogComponent {
  id: string;
  name: string;
  filePath?: string;
  category: string;
  props: { name: string; type: string; required: boolean; defaultValue?: string }[];
  exportName?: string;
}

interface Catalog {
  generatedAt: string | null;
  componentDir?: string;
  components: CatalogComponent[];
}

function readJson(filePath: string): Catalog | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function GET() {
  const roots = [process.cwd(), resolve(process.cwd(), "../..")];

  // CLIスキャン + Figmaプラグインの両ソースをマージ
  const components: CatalogComponent[] = [];
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
      for (const c of (figma as { components: CatalogComponent[] }).components) {
        const comp = { ...c, category: c.category || "Figma" };
        if (!seen.has(comp.id)) { seen.add(comp.id); components.push(comp); }
      }
    }
  }

  return NextResponse.json({ generatedAt, componentDir, components });
}
