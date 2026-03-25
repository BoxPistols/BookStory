import { build, context } from "esbuild";
import { writeFileSync, mkdirSync } from "fs";

const isWatch = process.argv.includes("--watch");

mkdirSync("dist", { recursive: true });

// Plugin code (Figma sandbox)
const codeConfig = {
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  format: "iife",
  target: "es2017",
};

// UI HTML
const uiHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, 'Noto Sans JP', sans-serif; font-size: 13px; color: #333; padding: 16px; }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .btn { display: block; width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 8px; }
    .btn-primary { background: #FF4785; color: #fff; }
    .btn-primary:hover { background: #E0296B; }
    .btn-secondary { background: #f0f0f0; color: #333; }
    .btn-secondary:hover { background: #e0e0e0; }
    .status { padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 12px; display: none; }
    .status.show { display: block; }
    .status.success { background: #E8F5E9; color: #2E7D32; }
    .status.error { background: #FFEBEE; color: #C62828; }
    .status.info { background: #E3F2FD; color: #1565C0; }
    .section { margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    input { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
    .count { font-size: 24px; font-weight: 800; color: #FF4785; }
    .meta { font-size: 11px; color: #999; margin-top: 4px; }
  </style>
</head>
<body>
  <h2>BookStory</h2>

  <div class="section">
    <div class="label">スキャン結果</div>
    <div class="count" id="count">-</div>
    <div class="meta" id="meta">コンポーネントをスキャンしてください</div>
  </div>

  <button class="btn btn-primary" id="scan">コンポーネントをスキャン</button>
  <button class="btn btn-secondary" id="publish">GitHub に公開</button>

  <div class="section" style="margin-top: 16px;">
    <div class="label">GitHub設定</div>
    <input type="text" id="repo" placeholder="owner/repo" />
    <input type="text" id="token" placeholder="GitHub Token (ghp_...)" />
  </div>

  <div class="status" id="status"></div>

  <script>
    const scanBtn = document.getElementById('scan');
    const publishBtn = document.getElementById('publish');
    const statusEl = document.getElementById('status');
    const countEl = document.getElementById('count');
    const metaEl = document.getElementById('meta');

    scanBtn.onclick = () => parent.postMessage({ pluginMessage: { type: 'scan' } }, '*');
    publishBtn.onclick = () => {
      const repo = document.getElementById('repo').value;
      const token = document.getElementById('token').value;
      if (!repo || !token) {
        showStatus('GitHub設定を入力してください', 'error');
        return;
      }
      parent.postMessage({ pluginMessage: { type: 'publish', repo, token } }, '*');
    };

    window.onmessage = (e) => {
      const msg = e.data.pluginMessage;
      if (!msg) return;

      if (msg.type === 'scan-result') {
        countEl.textContent = msg.count;
        metaEl.textContent = msg.count + ' コンポーネント / ' + msg.tokenCount + ' トークン';
        showStatus('スキャン完了', 'success');
      }
      if (msg.type === 'publish-result') {
        showStatus(msg.success ? 'PR作成完了: ' + msg.url : 'エラー: ' + msg.error, msg.success ? 'success' : 'error');
      }
      if (msg.type === 'status') {
        showStatus(msg.message, msg.level || 'info');
      }
    };

    function showStatus(text, level) {
      statusEl.textContent = text;
      statusEl.className = 'status show ' + level;
    }
  </script>
</body>
</html>`;

writeFileSync("dist/ui.html", uiHtml);

if (isWatch) {
  const ctx = await context(codeConfig);
  await ctx.watch();
  console.log("Watching...");
} else {
  await build(codeConfig);
  console.log("Build complete.");
}
