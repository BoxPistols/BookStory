#!/usr/bin/env node

import { Command } from "commander";
import { scanCommand } from "./commands/scan.js";
import { initCommand } from "./commands/init.js";
import { devCommand } from "./commands/dev.js";

const program = new Command();

program
  .name("bookstory")
  .description("デザイナーフレンドリーなコンポーネントカタログ CLI")
  .version("0.1.0");

program
  .command("init")
  .description("BookStory の設定ファイルを初期化")
  .action(initCommand);

program
  .command("scan")
  .description("プロジェクトのコンポーネントをスキャンしてストーリーを生成")
  .option("-d, --dir <path>", "コンポーネントディレクトリ", "src/components")
  .option("-o, --output <path>", "出力先", ".bookstory")
  .action(scanCommand);

program
  .command("dev")
  .description("BookStory 開発サーバーを起動")
  .option("-p, --port <number>", "ポート番号", "3200")
  .action(devCommand);

program.parse();
