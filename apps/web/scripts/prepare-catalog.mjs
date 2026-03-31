// ビルド前に .bookstory/ のカタログデータを src/data/ にコピー
// Vercel上でprocess.cwd()パス解決が失敗する問題の回避策
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, "..");
const repoRoot = resolve(webRoot, "../..");
const dataDir = resolve(webRoot, "src/data");

mkdirSync(dataDir, { recursive: true });

// Figma カタログ
const figmaSrc = resolve(repoRoot, ".bookstory/figma-catalog.json");
const figmaDst = resolve(dataDir, "figma-catalog.json");
if (existsSync(figmaSrc)) {
  copyFileSync(figmaSrc, figmaDst);
  console.log("prepare-catalog: figma-catalog.json copied");
} else {
  writeFileSync(figmaDst, JSON.stringify({ components: [], tokens: [] }));
  console.log("prepare-catalog: figma-catalog.json (empty placeholder)");
}

// CLI カタログ
const cliSrc = resolve(repoRoot, ".bookstory/catalog.json");
const cliDst = resolve(dataDir, "catalog.json");
if (existsSync(cliSrc)) {
  copyFileSync(cliSrc, cliDst);
  console.log("prepare-catalog: catalog.json copied");
} else {
  writeFileSync(cliDst, JSON.stringify({ components: [] }));
  console.log("prepare-catalog: catalog.json (empty placeholder)");
}
