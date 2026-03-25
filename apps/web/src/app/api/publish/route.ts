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
  const headers: Record<string, string> = {
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

    // 2. カタログJSONを作成
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

    // 3. 既存ファイルのSHAを取得（上書き更新に必要）
    let fileSha: string | undefined;
    const existRes = await fetch(
      `${baseUrl}/contents/.bookstory/figma-catalog.json?ref=${defaultBranch}`,
      { headers }
    );
    if (existRes.ok) {
      const existData = await existRes.json();
      fileSha = existData.sha;
    }

    // 4. mainに直接コミット（PR不要 = デザイナーがマージ操作不要）
    const commitBody: Record<string, string> = {
      message: `BookStory: Figmaデザイン同期 (${components.length} components, ${tokens.length} tokens)`,
      content,
      branch: defaultBranch,
    };
    if (fileSha) commitBody.sha = fileSha;

    const commitRes = await fetch(
      `${baseUrl}/contents/.bookstory/figma-catalog.json`,
      { method: "PUT", headers, body: JSON.stringify(commitBody) }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return NextResponse.json(
        { error: `コミット失敗: ${err.message || commitRes.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${components.length} コンポーネント / ${tokens.length} トークンを反映しました`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
