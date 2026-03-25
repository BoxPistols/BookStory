// BookStory Figma Plugin - メインコード
// Figma sandbox 内で実行される

figma.showUI(__html__, { width: 320, height: 480 });

// --- 型定義 ---

interface ExtractedComponent {
  id: string;
  name: string;
  description: string;
  variants: Record<string, string[]>;
  props: ExtractedProp[];
}

interface ExtractedProp {
  name: string;
  type: string;
  options?: string[];
  defaultValue?: string;
}

interface ExtractedToken {
  name: string;
  type: "color" | "typography" | "spacing" | "effect";
  value: unknown;
  modes?: Record<string, unknown>;
}

// --- コンポーネントスキャン ---

function scanComponents(): ExtractedComponent[] {
  const components: ExtractedComponent[] = [];
  const seen = new Set<string>();

  // ローカルコンポーネントをすべて取得
  const localComponents = figma.root.findAllWithCriteria({
    types: ["COMPONENT", "COMPONENT_SET"],
  });

  for (const node of localComponents) {
    if (seen.has(node.name)) continue;
    seen.add(node.name);

    if (node.type === "COMPONENT_SET") {
      // コンポーネントセット（バリアント付き）
      const variants: Record<string, string[]> = {};
      const props: ExtractedProp[] = [];

      for (const child of node.children) {
        if (child.type !== "COMPONENT") continue;
        // "Property1=Value1, Property2=Value2" 形式を解析
        const parts = child.name.split(",").map((s) => s.trim());
        for (const part of parts) {
          const [key, val] = part.split("=").map((s) => s.trim());
          if (!key || !val) continue;
          if (!variants[key]) variants[key] = [];
          if (!variants[key].includes(val)) variants[key].push(val);
        }
      }

      // バリアントから Props を生成
      for (const [key, values] of Object.entries(variants)) {
        props.push({
          name: key.charAt(0).toLowerCase() + key.slice(1),
          type: values.length <= 6 ? "select" : "string",
          options: values,
          defaultValue: values[0],
        });
      }

      components.push({
        id: node.id,
        name: node.name,
        description: node.description || "",
        variants,
        props,
      });
    } else if (node.type === "COMPONENT") {
      // 単体コンポーネント
      components.push({
        id: node.id,
        name: node.name,
        description: node.description || "",
        variants: {},
        props: [],
      });
    }
  }

  return components;
}

// --- トークン抽出 ---

function scanTokens(): ExtractedToken[] {
  const tokens: ExtractedToken[] = [];

  // ローカルスタイル: カラー
  const paintStyles = figma.getLocalPaintStyles();
  for (const style of paintStyles) {
    const paint = style.paints[0];
    if (paint && paint.type === "SOLID") {
      const { r, g, b } = paint.color;
      const hex =
        "#" +
        [r, g, b]
          .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
          .join("");
      tokens.push({
        name: style.name,
        type: "color",
        value: hex,
      });
    }
  }

  // ローカルスタイル: テキスト
  const textStyles = figma.getLocalTextStyles();
  for (const style of textStyles) {
    tokens.push({
      name: style.name,
      type: "typography",
      value: {
        fontFamily: style.fontName.family,
        fontWeight: style.fontName.style,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
      },
    });
  }

  // ローカルスタイル: エフェクト（シャドウ等）
  const effectStyles = figma.getLocalEffectStyles();
  for (const style of effectStyles) {
    tokens.push({
      name: style.name,
      type: "effect",
      value: style.effects.map((e) => ({
        type: e.type,
        visible: e.visible,
      })),
    });
  }

  // バリアブルコレクション
  try {
    const collections = figma.variables.getLocalVariableCollections();
    for (const collection of collections) {
      for (const varId of collection.variableIds) {
        const variable = figma.variables.getVariableById(varId);
        if (!variable) continue;

        const modes: Record<string, unknown> = {};
        for (const mode of collection.modes) {
          const val = variable.valuesByMode[mode.modeId];
          modes[mode.name] = val;
        }

        let type: ExtractedToken["type"] = "color";
        if (variable.resolvedType === "FLOAT") type = "spacing";
        else if (variable.resolvedType === "STRING") type = "typography";

        tokens.push({
          name: `${collection.name}/${variable.name}`,
          type,
          value: Object.values(variable.valuesByMode)[0],
          modes: Object.keys(modes).length > 1 ? modes : undefined,
        });
      }
    }
  } catch {
    // バリアブル API が利用できない場合は無視
  }

  return tokens;
}

// --- GitHub PR 作成 ---

async function createGitHubPR(
  repo: string,
  token: string,
  components: ExtractedComponent[],
  tokens: ExtractedToken[]
) {
  const baseUrl = `https://api.github.com/repos/${repo}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };

  // 1. デフォルトブランチを取得
  const repoRes = await fetch(baseUrl, { headers });
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // 2. 最新の SHA を取得
  const refRes = await fetch(`${baseUrl}/git/ref/heads/${defaultBranch}`, { headers });
  const refData = await refRes.json();
  const baseSha = refData.object.sha;

  // 3. ブランチ作成
  const branchName = `bookstory/figma-sync-${Date.now()}`;
  await fetch(`${baseUrl}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
  });

  // 4. ファイルをコミット
  const catalog = {
    generatedAt: new Date().toISOString(),
    source: "figma",
    components,
    tokens,
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(catalog, null, 2))));

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
      title: `[BookStory] Figmaデザイン同期`,
      body: `## Figma からの自動同期\n\n- コンポーネント: ${components.length}件\n- トークン: ${tokens.length}件\n\n生成元: BookStory Figma Plugin`,
      head: branchName,
      base: defaultBranch,
    }),
  });

  const prData = await prRes.json();
  return prData.html_url;
}

// --- メッセージハンドリング ---

figma.ui.onmessage = async (msg: { type: string; repo?: string; token?: string }) => {
  if (msg.type === "scan") {
    figma.ui.postMessage({ type: "status", message: "スキャン中...", level: "info" });

    const components = scanComponents();
    const tokens = scanTokens();

    figma.ui.postMessage({
      type: "scan-result",
      count: components.length,
      tokenCount: tokens.length,
      components,
      tokens,
    });
  }

  if (msg.type === "publish") {
    if (!msg.repo || !msg.token) return;

    figma.ui.postMessage({ type: "status", message: "GitHub PR を作成中...", level: "info" });

    try {
      const components = scanComponents();
      const tokens = scanTokens();
      const url = await createGitHubPR(msg.repo, msg.token, components, tokens);

      figma.ui.postMessage({
        type: "publish-result",
        success: true,
        url,
      });
    } catch (err) {
      figma.ui.postMessage({
        type: "publish-result",
        success: false,
        error: String(err),
      });
    }
  }
};
