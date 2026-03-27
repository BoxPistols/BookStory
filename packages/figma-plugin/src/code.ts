// BookStory Figma Plugin - メインコード
// Figma sandbox 内で実行される

figma.showUI(__html__, { width: 320, height: 400 });

// dynamic-page モードでは全ページの読み込みが必要
figma.loadAllPagesAsync();

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

async function scanTokens(): Promise<ExtractedToken[]> {
  const tokens: ExtractedToken[] = [];

  // ローカルスタイル: カラー
  const paintStyles = await figma.getLocalPaintStylesAsync();
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
  const textStyles = await figma.getLocalTextStylesAsync();
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
  const effectStyles = await figma.getLocalEffectStylesAsync();
  for (const style of effectStyles) {
    tokens.push({
      name: style.name,
      type: "effect",
      value: style.effects.map(function (e) {
        return { type: e.type, visible: e.visible };
      }),
    });
  }

  // バリアブルコレクション（async API必須）
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const collection of collections) {
      for (const varId of collection.variableIds) {
        const variable = await figma.variables.getVariableByIdAsync(varId);
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
    try {
      figma.ui.postMessage({ type: "status", message: "コンポーネントをスキャン中...", level: "info" });
      const components = scanComponents();

      figma.ui.postMessage({ type: "status", message: "トークンを抽出中...", level: "info" });
      const tokens = await scanTokens();

      figma.ui.postMessage({
        type: "scan-result",
        count: components.length,
        tokenCount: tokens.length,
        components: components,
        tokens: tokens,
      });
    } catch (err) {
      figma.ui.postMessage({
        type: "status",
        message: "スキャンエラー: " + String(err),
        level: "error",
      });
    }
  }

  if (msg.type === "import-web") {
    const serverUrl = msg.serverUrl;
    if (!serverUrl) return;

    figma.ui.postMessage({ type: "status", message: "Webトークンを取得中...", level: "info" });

    try {
      const res = await fetch(serverUrl + "/api/export");
      const data = await res.json();

      // Color Variables を作成/更新
      if (data.colors) {
        figma.ui.postMessage({ type: "status", message: "Color Variables を更新中...", level: "info" });

        // 既存のColorコレクションを探す
        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        let colorCol = collections.find(function(c) { return c.name === "Color"; });

        if (!colorCol) {
          colorCol = figma.variables.createVariableCollection("Color");
          colorCol.renameMode(colorCol.modes[0].modeId, "Light");
          colorCol.addMode("Dark");
        }

        const lightModeId = colorCol.modes[0].modeId;
        const darkModeId = colorCol.modes.length > 1 ? colorCol.modes[1].modeId : lightModeId;

        // 既存変数をマップ
        const existingVars: Record<string, Variable> = {};
        for (const varId of colorCol.variableIds) {
          const v = await figma.variables.getVariableByIdAsync(varId);
          if (v) existingVars[v.name] = v;
        }

        function hexToRgb(hex: string) {
          return {
            r: parseInt(hex.substring(1, 3), 16) / 255,
            g: parseInt(hex.substring(3, 5), 16) / 255,
            b: parseInt(hex.substring(5, 7), 16) / 255,
          };
        }

        const lightColors = data.colors.light as Record<string, string>;
        const darkColors = data.colors.dark as Record<string, string>;

        for (const [name, lightHex] of Object.entries(lightColors)) {
          const darkHex = darkColors[name] || lightHex;
          let variable = existingVars[name];
          if (!variable) {
            variable = figma.variables.createVariable(name, colorCol, "COLOR");
          }
          variable.setValueForMode(lightModeId, hexToRgb(lightHex));
          variable.setValueForMode(darkModeId, hexToRgb(darkHex));
        }
      }

      // Spacing Variables を作成/更新
      if (data.spacing) {
        figma.ui.postMessage({ type: "status", message: "Spacing Variables を更新中...", level: "info" });

        const collections = await figma.variables.getLocalVariableCollectionsAsync();
        let spacingCol = collections.find(function(c) { return c.name === "Spacing"; });

        if (!spacingCol) {
          spacingCol = figma.variables.createVariableCollection("Spacing");
        }
        const modeId = spacingCol.modes[0].modeId;

        const existingVars: Record<string, Variable> = {};
        for (const varId of spacingCol.variableIds) {
          const v = await figma.variables.getVariableByIdAsync(varId);
          if (v) existingVars[v.name] = v;
        }

        const values = data.spacing.values as number[];
        for (const val of values) {
          const name = "spacing/" + (val / (data.spacing.base as number));
          let variable = existingVars[name];
          if (!variable) {
            variable = figma.variables.createVariable(name, spacingCol, "FLOAT");
          }
          variable.setValueForMode(modeId, val);
        }
      }

      // Typography Text Styles を作成/更新
      if (data.typography) {
        figma.ui.postMessage({ type: "status", message: "Typography Styles を更新中...", level: "info" });

        const existingTextStyles = await figma.getLocalTextStylesAsync();
        const styleMap: Record<string, TextStyle> = {};
        for (const s of existingTextStyles) {
          styleMap[s.name] = s;
        }

        // weight 文字列を Figma の fontStyle にマッピング
        function mapWeight(weight: string): string {
          const w = String(weight);
          if (w === "SemiBold") return "Semi Bold";
          if (w === "Bold") return "Bold";
          return "Regular";
        }

        // data.typography は { "Heading/H5": { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing? }, ... } 形式
        const typoObj = data.typography as Record<string, {
          fontFamily: string;
          fontWeight: string;
          fontSize: number;
          lineHeight: number;
          letterSpacing?: number;
        }>;

        for (const [name, entry] of Object.entries(typoObj)) {
          let style = styleMap[name];
          if (!style) {
            style = figma.createTextStyle();
            style.name = name;
          }

          const fontName: FontName = {
            family: entry.fontFamily,
            style: mapWeight(entry.fontWeight),
          };
          try {
            await figma.loadFontAsync(fontName);
            style.fontName = fontName;
          } catch (_e) {
            // フォントが利用不可の場合はスキップ
          }
          style.fontSize = entry.fontSize;
          style.lineHeight = {
            value: entry.fontSize * entry.lineHeight,
            unit: "PIXELS",
          };

          if (entry.letterSpacing !== undefined) {
            style.letterSpacing = {
              value: entry.letterSpacing,
              unit: "PIXELS",
            };
          }
        }
      }

      figma.ui.postMessage({
        type: "import-result",
        success: true,
        message: "Webトークンを取り込みました",
      });
    } catch (err) {
      const message = (err && typeof err === "object" && "message" in err)
        ? (err as { message: string }).message
        : JSON.stringify(err);
      figma.ui.postMessage({
        type: "import-result",
        success: false,
        error: message,
      });
    }
  }

  if (msg.type === "publish") {
    const serverUrl = msg.serverUrl;
    if (!serverUrl) return;

    figma.ui.postMessage({ type: "status", message: "公開中...", level: "info" });

    try {
      const components = scanComponents();
      const tokens = await scanTokens();

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
          message: data.message || "反映完了！",
        });
      } else {
        figma.ui.postMessage({
          type: "publish-result",
          success: false,
          error: data.error || "不明なエラー",
        });
      }
    } catch (err) {
      const message = (err && typeof err === "object" && "message" in err)
        ? (err as { message: string }).message
        : JSON.stringify(err);
      figma.ui.postMessage({
        type: "publish-result",
        success: false,
        error: message,
      });
    }
  }
};
