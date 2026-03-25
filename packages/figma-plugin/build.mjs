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

// UI HTML — デザイナー向け: トークン入力不要
const uiHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, 'Noto Sans JP', sans-serif; font-size: 13px; color: #333; padding: 16px; }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .btn { display: block; width: 100%; padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 8px; transition: background 0.15s; }
    .btn-primary { background: #FF4785; color: #fff; }
    .btn-primary:hover { background: #E0296B; }
    .btn-publish { background: #2642be; color: #fff; }
    .btn-publish:hover { background: #1a2f8a; }
    .btn-publish:disabled { background: #ccc; cursor: not-allowed; }
    .status { padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 12px; display: none; word-break: break-all; }
    .status.show { display: block; }
    .status.success { background: #E8F5E9; color: #2E7D32; }
    .status.error { background: #FFEBEE; color: #C62828; }
    .status.info { background: #E3F2FD; color: #1565C0; }
    .section { margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .count { font-size: 24px; font-weight: 800; color: #FF4785; }
    .meta { font-size: 11px; color: #999; margin-top: 4px; }
    .server-section { margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; }
    .server-section input { width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; color: #666; }
    .link { color: #2642be; text-decoration: none; font-size: 12px; }
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
  <button class="btn btn-publish" id="publish" disabled>コードに反映する</button>

  <div class="status" id="status"></div>

  <div class="server-section">
    <div class="label">接続先サーバー</div>
    <input type="text" id="server" value="https://bookstory-wine.vercel.app" />
  </div>

  <script>
    var scanBtn = document.getElementById('scan');
    var publishBtn = document.getElementById('publish');
    var statusEl = document.getElementById('status');
    var countEl = document.getElementById('count');
    var metaEl = document.getElementById('meta');
    var serverInput = document.getElementById('server');
    var hasScanned = false;

    // サーバーURLをlocalStorageに保存/復元
    var saved = localStorage.getItem('bookstory-server');
    if (saved) serverInput.value = saved;
    serverInput.onchange = function() {
      localStorage.setItem('bookstory-server', serverInput.value);
    };

    scanBtn.onclick = function() {
      parent.postMessage({ pluginMessage: { type: 'scan' } }, '*');
    };

    publishBtn.onclick = function() {
      var serverUrl = serverInput.value.replace(/\\/$/, '');
      if (!serverUrl) {
        showStatus('接続先サーバーを入力してください', 'error');
        return;
      }
      parent.postMessage({ pluginMessage: { type: 'publish', serverUrl: serverUrl } }, '*');
    };

    window.onmessage = function(e) {
      var msg = e.data.pluginMessage;
      if (!msg) return;

      if (msg.type === 'scan-result') {
        countEl.textContent = msg.count;
        metaEl.textContent = msg.count + ' コンポーネント / ' + msg.tokenCount + ' トークン';
        hasScanned = true;
        publishBtn.disabled = msg.count === 0 && msg.tokenCount === 0;
        showStatus('スキャン完了', 'success');
      }
      if (msg.type === 'publish-result') {
        if (msg.success) {
          showStatus('PR作成完了！', 'success');
          statusEl.innerHTML = 'PR作成完了！ <a href="' + msg.url + '" target="_blank" class="link">PRを確認する</a>';
        } else {
          showStatus('エラー: ' + msg.error, 'error');
        }
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
