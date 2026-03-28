import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { corsHeaders } from "@/lib/cors";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BOOKSTORY_API_KEY = process.env.BOOKSTORY_API_KEY;

/** タイミング攻撃を防ぐ定数時間の文字列比較 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function jsonRes(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(data, { status, headers });
}

// CORSプリフライト
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req, "POST, OPTIONS") });
}

// ペイロードサイズ上限 (5MB)
const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const headers = corsHeaders(req, "POST, OPTIONS");

  // 認証チェック（BOOKSTORY_API_KEY 未設定時は警告ログ+拒否）
  if (!BOOKSTORY_API_KEY) {
    console.warn("[BookStory] BOOKSTORY_API_KEY が未設定です。Publish APIは認証なしでは利用できません。");
    return jsonRes({ error: "サーバーにBOOKSTORY_API_KEYが未設定です。管理者に連絡してください。" }, 500, headers);
  }
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || !safeEqual(token, BOOKSTORY_API_KEY)) {
    return jsonRes({ error: "認証エラー: 無効なAPIキーです" }, 401, headers);
  }

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return jsonRes({ error: "サーバーにGITHUB_TOKEN / GITHUB_REPOが未設定です" }, 500, headers);
  }

  // ペイロードサイズチェック（実際のボディサイズで検証）
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return jsonRes({ error: "リクエストボディの読み取りに失敗しました" }, 400, headers);
  }
  if (rawBody.length > MAX_PAYLOAD_SIZE) {
    return jsonRes({ error: "ペイロードが大きすぎます（上限: 5MB）" }, 413, headers);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonRes({ error: "不正なJSONです" }, 400, headers);
  }

  // バリデーション
  if (!body || typeof body !== "object") {
    return jsonRes({ error: "リクエストボディが不正です" }, 400, headers);
  }
  const { components, tokens } = body as Record<string, unknown>;

  if (!Array.isArray(components) || !Array.isArray(tokens)) {
    return jsonRes({ error: "components と tokens は配列で指定してください" }, 400, headers);
  }

  if (components.length > 500) {
    return jsonRes({ error: "コンポーネント数が上限（500）を超えています" }, 400, headers);
  }

  if (tokens.length > 1000) {
    return jsonRes({ error: "トークン数が上限（1000）を超えています" }, 400, headers);
  }

  // 各コンポーネントの最低限の構造チェック
  for (const comp of components) {
    if (!comp || typeof comp !== "object" || !("id" in comp) || !("name" in comp)) {
      return jsonRes({ error: "コンポーネントにはid, nameが必須です" }, 400, headers);
    }
  }

  const baseUrl = `https://api.github.com/repos/${GITHUB_REPO}`;
  const ghHeaders: Record<string, string> = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // 1. デフォルトブランチ取得
    const repoRes = await fetch(baseUrl, { headers: ghHeaders });
    if (!repoRes.ok) {
      return jsonRes({ error: `リポジトリ取得失敗: ${repoRes.status}` }, 502, headers);
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. 最新SHAを取得
    const refRes = await fetch(
      `${baseUrl}/git/ref/heads/${defaultBranch}`,
      { headers: ghHeaders }
    );
    if (!refRes.ok) {
      return jsonRes({ error: `ブランチ参照取得失敗: ${refRes.status}` }, 502, headers);
    }
    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // 3. ブランチ作成
    const branchName = `bookstory/figma-sync-${Date.now()}`;
    const branchRes = await fetch(`${baseUrl}/git/refs`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });
    if (!branchRes.ok) {
      const err = await branchRes.json();
      return jsonRes({ error: `ブランチ作成失敗: ${err.message || branchRes.status}` }, 502, headers);
    }

    // 4. カタログファイルをコミット
    const catalog = {
      generatedAt: new Date().toISOString(),
      source: "figma",
      components,
      tokens,
    };
    const content = Buffer.from(
      JSON.stringify(catalog, null, 2),
      "utf-8"
    ).toString("base64");

    let fileSha: string | undefined;
    const existRes = await fetch(
      `${baseUrl}/contents/.bookstory/figma-catalog.json?ref=${defaultBranch}`,
      { headers: ghHeaders }
    );
    if (existRes.ok) {
      const existData = await existRes.json();
      fileSha = existData.sha;
    }

    const commitBody: Record<string, string> = {
      message: `BookStory: Figmaデザイン同期 (${components.length} components, ${tokens.length} tokens)`,
      content,
      branch: branchName,
    };
    if (fileSha) commitBody.sha = fileSha;

    const commitRes = await fetch(
      `${baseUrl}/contents/.bookstory/figma-catalog.json`,
      { method: "PUT", headers: ghHeaders, body: JSON.stringify(commitBody) }
    );
    if (!commitRes.ok) {
      const err = await commitRes.json();
      // コミット失敗時もブランチ削除を試みる
      await fetch(`${baseUrl}/git/refs/heads/${branchName}`, {
        method: "DELETE",
        headers: ghHeaders,
      }).catch(() => {});
      return jsonRes({ error: `コミット失敗: ${err.message || commitRes.status}` }, 502, headers);
    }

    // 5. 自動マージ
    const mergeRes = await fetch(`${baseUrl}/merges`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({
        base: defaultBranch,
        head: branchName,
        commit_message: `BookStory: Figmaデザイン同期 (${components.length} components, ${tokens.length} tokens)`,
      }),
    });

    // 6. マージ結果を確認してからブランチ削除
    if (!mergeRes.ok) {
      const err = await mergeRes.json();
      return jsonRes({
        error: `マージ失敗（コンフリクトの可能性）: ${err.message || mergeRes.status}`,
        branch: branchName,
        suggestion: "手動でマージするか、GitHubでPull Requestを作成してください",
      }, 409, headers);
    }

    // マージ成功後にブランチ削除
    await fetch(`${baseUrl}/git/refs/heads/${branchName}`, {
      method: "DELETE",
      headers: ghHeaders,
    }).catch(() => {});

    return jsonRes({
      success: true,
      message: `${components.length} コンポーネント / ${tokens.length} トークンを反映しました`,
    }, 200, headers);
  } catch (err) {
    return jsonRes(
      { error: err instanceof Error ? err.message : String(err) },
      500,
      headers
    );
  }
}
