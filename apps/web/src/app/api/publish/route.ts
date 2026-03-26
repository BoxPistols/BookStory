import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonRes(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CORS_HEADERS });
}

// CORSプリフライト
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return jsonRes({ error: "サーバーにGITHUB_TOKEN / GITHUB_REPOが未設定です" }, 500);
  }

  const body = await req.json();
  const { components, tokens } = body;

  if (!components || !tokens) {
    return jsonRes({ error: "components と tokens が必要です" }, 400);
  }

  const baseUrl = `https://api.github.com/repos/${GITHUB_REPO}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // 1. デフォルトブランチ取得
    const repoRes = await fetch(baseUrl, { headers });
    if (!repoRes.ok) {
      return jsonRes({ error: `リポジトリ取得失敗: ${repoRes.status}` }, 502);
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. 最新SHAを取得
    const refRes = await fetch(
      `${baseUrl}/git/ref/heads/${defaultBranch}`,
      { headers }
    );
    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // 3. ブランチ作成
    const branchName = `bookstory/figma-sync-${Date.now()}`;
    const branchRes = await fetch(`${baseUrl}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });
    if (!branchRes.ok) {
      const err = await branchRes.json();
      return jsonRes({ error: `ブランチ作成失敗: ${err.message || branchRes.status}` }, 502);
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
      { headers }
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
      { method: "PUT", headers, body: JSON.stringify(commitBody) }
    );
    if (!commitRes.ok) {
      const err = await commitRes.json();
      return jsonRes({ error: `コミット失敗: ${err.message || commitRes.status}` }, 502);
    }

    // 5. 自動マージ
    const mergeRes = await fetch(`${baseUrl}/merges`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        base: defaultBranch,
        head: branchName,
        commit_message: `BookStory: Figmaデザイン同期 (${components.length} components, ${tokens.length} tokens)`,
      }),
    });

    // 6. ブランチ削除
    await fetch(`${baseUrl}/git/refs/heads/${branchName}`, {
      method: "DELETE",
      headers,
    });

    if (!mergeRes.ok) {
      const err = await mergeRes.json();
      return jsonRes({ error: `マージ失敗: ${err.message || mergeRes.status}` }, 502);
    }

    return jsonRes({
      success: true,
      message: `${components.length} コンポーネント / ${tokens.length} トークンを反映しました`,
    });
  } catch (err) {
    return jsonRes(
      { error: err instanceof Error ? err.message : String(err) },
      500
    );
  }
}
