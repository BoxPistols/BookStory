import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;

export async function POST(req: NextRequest) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return NextResponse.json(
      { error: "サーバーにGITHUB_TOKEN / GITHUB_REPOが未設定です" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { components, tokens } = body;

  if (!components || !tokens) {
    return NextResponse.json(
      { error: "components と tokens が必要です" },
      { status: 400 }
    );
  }

  const baseUrl = `https://api.github.com/repos/${GITHUB_REPO}`;
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  try {
    // 1. デフォルトブランチを取得
    const repoRes = await fetch(baseUrl, { headers });
    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `リポジトリ取得失敗: ${repoRes.status}` },
        { status: 502 }
      );
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. 最新の SHA を取得
    const refRes = await fetch(
      `${baseUrl}/git/ref/heads/${defaultBranch}`,
      { headers }
    );
    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // 3. ブランチ作成
    const branchName = `bookstory/figma-sync-${Date.now()}`;
    await fetch(`${baseUrl}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });

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

    await fetch(`${baseUrl}/contents/.bookstory/figma-catalog.json`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `BookStory: Figmaからコンポーネント同期 (${components.length} components, ${tokens.length} tokens)`,
        content,
        branch: branchName,
      }),
    });

    // 5. PR 作成
    const prRes = await fetch(`${baseUrl}/pulls`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: "[BookStory] Figmaデザイン同期",
        body: `## Figma からの自動同期\n\n- コンポーネント: ${components.length}件\n- トークン: ${tokens.length}件\n\n生成元: BookStory Figma Plugin`,
        head: branchName,
        base: defaultBranch,
      }),
    });

    const prData = await prRes.json();

    return NextResponse.json({
      success: true,
      url: prData.html_url,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
