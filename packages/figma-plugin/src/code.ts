// BookStory Figma Plugin - メインコード
// Figma sandbox 内で実行される

figma.showUI(__html__, { width: 320, height: 400 });

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
        const parts = child.name.split(",").map(function (s) { return s.trim(); });
        for (const part of parts) {
          const kv = part.split("=").map(function (s) { return s.trim(); });
          const key = kv[0];
          const val = kv[1];
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
      const r = paint.color.r;
      const g = paint.color.g;
      const b = paint.color.b;
      const hex =
        "#" +
        [r, g, b]
          .map(function (c) { return Math.round(c * 255).toString(16).padStart(2, "0"); })
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
      value: style.effects.map(function (e) {
        return { type: e.type, visible: e.visible };
      }),
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
          name: collection.name + "/" + variable.name,
          type,
          value: Object.values(variable.valuesByMode)[0],
          modes: Object.keys(modes).length > 1 ? modes : undefined,
        });
      }
    }
  } catch (_e) {
    // バリアブル API が利用できない場合は無視
  }

  return tokens;
}

// --- メッセージハンドリング ---
// BookStory サーバー経由で公開（トークン不要）

figma.ui.onmessage = async function (msg: { type: string; serverUrl?: string }) {
  if (msg.type === "scan") {
    figma.ui.postMessage({ type: "status", message: "スキャン中...", level: "info" });

    const components = scanComponents();
    const tokens = scanTokens();

    figma.ui.postMessage({
      type: "scan-result",
      count: components.length,
      tokenCount: tokens.length,
      components: components,
      tokens: tokens,
    });
  }

  if (msg.type === "publish") {
    const serverUrl = msg.serverUrl;
    if (!serverUrl) return;

    figma.ui.postMessage({ type: "status", message: "公開中...", level: "info" });

    try {
      const components = scanComponents();
      const tokens = scanTokens();

      const res = await fetch(serverUrl + "/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components: components, tokens: tokens }),
      });

      const data = await res.json();

      if (data.success) {
        figma.ui.postMessage({
          type: "publish-result",
          success: true,
          url: data.url,
        });
      } else {
        figma.ui.postMessage({
          type: "publish-result",
          success: false,
          error: data.error || "不明なエラー",
        });
      }
    } catch (err) {
      figma.ui.postMessage({
        type: "publish-result",
        success: false,
        error: String(err),
      });
    }
  }
};
