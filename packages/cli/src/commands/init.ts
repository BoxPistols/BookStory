import { writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const DEFAULT_CONFIG = {
  $schema: "https://bookstory.dev/schema.json",
  componentDir: "src/components",
  output: ".bookstory",
  framework: "react",
  styling: "auto",
  figma: {
    fileKey: "",
    autoSync: false,
  },
  theme: {
    mode: "light",
  },
};

export async function initCommand() {
  const configPath = resolve(process.cwd(), "bookstory.config.json");

  if (existsSync(configPath)) {
    console.log("bookstory.config.json は既に存在します。");
    return;
  }

  writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n");
  console.log("bookstory.config.json を作成しました。");
  console.log("");
  console.log("次のステップ:");
  console.log("  1. componentDir を編集してコンポーネントディレクトリを指定");
  console.log("  2. bookstory scan でコンポーネントをスキャン");
  console.log("  3. bookstory dev で開発サーバーを起動");
}
