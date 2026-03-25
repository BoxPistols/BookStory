import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, basename, relative } from "path";
import { glob } from "glob";

interface ScannedComponent {
  id: string;
  name: string;
  filePath: string;
  category: string;
  props: ScannedProp[];
  exportName: string;
}

interface ScannedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

// TSX ファイルから Props 型を簡易抽出
function extractProps(content: string): ScannedProp[] {
  const props: ScannedProp[] = [];

  // interface XxxProps { ... } パターン
  const interfaceMatch = content.match(
    /interface\s+\w*Props\s*\{([^}]+)\}/s
  );
  if (!interfaceMatch) return props;

  const body = interfaceMatch[1];
  const propLines = body.split("\n").filter((l) => l.includes(":"));

  for (const line of propLines) {
    const match = line.match(/^\s*(\w+)(\?)?\s*:\s*(.+?)(?:;|$)/);
    if (!match) continue;

    const [, name, optional, rawType] = match;
    const type = rawType.trim();

    // 一般的な型からコントロールタイプを推定
    let controlType = "string";
    if (type === "boolean") controlType = "boolean";
    else if (type === "number") controlType = "number";
    else if (type.includes("|") && type.includes('"')) controlType = "select";

    props.push({
      name,
      type: controlType,
      required: !optional,
    });
  }

  return props;
}

// エクスポート名を抽出
function extractExportName(content: string, fileName: string): string {
  // export default function Xxx
  const defaultMatch = content.match(
    /export\s+default\s+function\s+(\w+)/
  );
  if (defaultMatch) return defaultMatch[1];

  // export function Xxx
  const namedMatch = content.match(/export\s+function\s+(\w+)/);
  if (namedMatch) return namedMatch[1];

  // export const Xxx
  const constMatch = content.match(/export\s+const\s+(\w+)/);
  if (constMatch) return constMatch[1];

  // ファイル名から推定
  return basename(fileName, ".tsx");
}

// カテゴリ推定（ディレクトリ名から）
function inferCategory(filePath: string, baseDir: string): string {
  const rel = relative(baseDir, filePath);
  const parts = rel.split("/");
  if (parts.length > 1) return parts[0];
  return "Components";
}

interface ScanOptions {
  dir: string;
  output: string;
}

export async function scanCommand(options: ScanOptions) {
  const baseDir = resolve(process.cwd(), options.dir);
  const outputDir = resolve(process.cwd(), options.output);

  if (!existsSync(baseDir)) {
    console.error(`ディレクトリが見つかりません: ${baseDir}`);
    process.exit(1);
  }

  console.log(`スキャン中: ${baseDir}`);

  const files = await glob("**/*.tsx", {
    cwd: baseDir,
    ignore: [
      "**/*.stories.*",
      "**/*.test.*",
      "**/*.spec.*",
      "**/index.tsx",
      "**/__tests__/**",
    ],
  });

  const components: ScannedComponent[] = [];

  for (const file of files) {
    const fullPath = resolve(baseDir, file);
    const content = readFileSync(fullPath, "utf-8");

    // React コンポーネントかどうか判定（JSX を含むか）
    if (!content.includes("React") && !content.includes("jsx") && !content.match(/<\w+/)) {
      continue;
    }

    const exportName = extractExportName(content, file);
    const props = extractProps(content);
    const category = inferCategory(file, baseDir);

    components.push({
      id: exportName.toLowerCase(),
      name: exportName,
      filePath: relative(process.cwd(), fullPath),
      category,
      props,
      exportName,
    });
  }

  // 出力
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const catalog = {
    generatedAt: new Date().toISOString(),
    componentDir: options.dir,
    components,
  };

  const catalogPath = resolve(outputDir, "catalog.json");
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");

  console.log(`${components.length} コンポーネントをスキャンしました。`);
  console.log(`カタログ出力: ${catalogPath}`);
  console.log("");

  for (const comp of components) {
    console.log(`  ${comp.category}/${comp.name} (${comp.props.length} props)`);
  }
}
