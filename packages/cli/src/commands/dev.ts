import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { existsSync } from "fs";

interface DevOptions {
  port: string;
}

export async function devCommand(options: DevOptions) {
  // bookstory.config.json の存在チェック
  const configPath = resolve(process.cwd(), "bookstory.config.json");
  if (!existsSync(configPath)) {
    console.log("bookstory.config.json が見つかりません。");
    console.log("先に `bookstory init` を実行してください。");
    return;
  }

  console.log(`BookStory 開発サーバーを起動しています... (port: ${options.port})`);
  console.log("");

  // @bookstory/web の next dev を起動
  // モノレポ内では pnpm で起動
  const webDir = findWebPackage();
  if (!webDir) {
    console.log("@bookstory/web パッケージが見つかりません。");
    console.log("モノレポのルートから実行してください。");
    return;
  }

  const child = spawn("npx", ["next", "dev", "--port", options.port], {
    cwd: webDir,
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    process.exit(code ?? 0);
  });
}

function findWebPackage(): string | null {
  // モノレポ構成: apps/web
  const candidates = [
    resolve(process.cwd(), "apps/web"),
    resolve(process.cwd(), "../apps/web"),
    resolve(process.cwd(), "../../apps/web"),
  ];

  for (const dir of candidates) {
    if (existsSync(resolve(dir, "package.json"))) {
      return dir;
    }
  }

  return null;
}
