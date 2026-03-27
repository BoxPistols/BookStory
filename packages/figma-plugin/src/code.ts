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
  nodeTree?: FigmaNodeData;
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

// --- ノードツリー型定義（Figma → HTML/CSS 完全再現用） ---

interface FigmaNodeData {
  type: string;
  name: string;
  css: Record<string, string>;
  text?: string;
  children?: FigmaNodeData[];
}

// --- ノードツリー抽出 ---

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(function(c) {
    return Math.round(c * 255).toString(16).padStart(2, "0");
  }).join("");
}

function rgbaToStr(r: number, g: number, b: number, a: number): string {
  if (a >= 1) return rgbToHex(r, g, b);
  return "rgba(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + "," + a.toFixed(2) + ")";
}

function extractNodeTree(node: SceneNode, depth: number): FigmaNodeData | null {
  if (depth > 10) return null;
  if (!node.visible) return null;

  const css: Record<string, string> = {};
  const data: FigmaNodeData = {
    type: node.type,
    name: node.name,
    css: css,
  };

  // --- サイズ ---
  css["width"] = Math.round(node.width) + "px";
  css["height"] = Math.round(node.height) + "px";

  // --- 不透明度 ---
  if ("opacity" in node && typeof node.opacity === "number" && node.opacity < 1) {
    css["opacity"] = node.opacity.toFixed(2);
  }

  // --- 角丸 ---
  if ("cornerRadius" in node) {
    const cr = node.cornerRadius;
    if (typeof cr === "number" && cr > 0) {
      css["border-radius"] = cr + "px";
    }
  }

  // --- 塗り (fills) — テキストノードは color で処理するのでスキップ ---
  if ("fills" in node && node.type !== "TEXT") {
    const fills = node.fills;
    if (Array.isArray(fills) && fills.length > 0) {
      const fill = fills[0];
      if (fill.visible !== false) {
        if (fill.type === "SOLID") {
          const a = typeof fill.opacity === "number" ? fill.opacity : 1;
          css["background-color"] = rgbaToStr(fill.color.r, fill.color.g, fill.color.b, a);
        } else if (fill.type === "GRADIENT_LINEAR" && fill.gradientStops) {
          const stops = fill.gradientStops.map(function(s: { color: RGBA; position: number }) {
            return rgbaToStr(s.color.r, s.color.g, s.color.b, s.color.a) + " " + Math.round(s.position * 100) + "%";
          }).join(", ");
          css["background"] = "linear-gradient(" + stops + ")";
        }
      }
    }
  }

  // --- 線 (strokes) ---
  if ("strokes" in node) {
    const strokes = node.strokes;
    if (Array.isArray(strokes) && strokes.length > 0) {
      const stroke = strokes[0];
      if (stroke.visible !== false && stroke.type === "SOLID") {
        const sw = ("strokeWeight" in node && typeof node.strokeWeight === "number") ? node.strokeWeight : 1;
        css["border"] = sw + "px solid " + rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b);
      }
    }
  }

  // --- シャドウ (effects) ---
  if ("effects" in node) {
    const effects = node.effects;
    if (Array.isArray(effects)) {
      const shadows: string[] = [];
      for (const e of effects) {
        if (!e.visible) continue;
        if (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") {
          const prefix = e.type === "INNER_SHADOW" ? "inset " : "";
          shadows.push(
            prefix +
            Math.round(e.offset.x) + "px " +
            Math.round(e.offset.y) + "px " +
            Math.round(e.radius) + "px " +
            (e.spread ? Math.round(e.spread) + "px " : "") +
            rgbaToStr(e.color.r, e.color.g, e.color.b, e.color.a)
          );
        }
      }
      if (shadows.length > 0) {
        css["box-shadow"] = shadows.join(", ");
      }
    }
  }

  // --- Auto Layout (→ flexbox) ---
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    css["display"] = "flex";
    css["flex-direction"] = node.layoutMode === "HORIZONTAL" ? "row" : "column";

    if ("itemSpacing" in node && typeof node.itemSpacing === "number" && node.itemSpacing > 0) {
      css["gap"] = node.itemSpacing + "px";
    }
    if ("paddingTop" in node) {
      const pt = node.paddingTop || 0;
      const pr = node.paddingRight || 0;
      const pb = node.paddingBottom || 0;
      const pl = node.paddingLeft || 0;
      if (pt || pr || pb || pl) {
        css["padding"] = pt + "px " + pr + "px " + pb + "px " + pl + "px";
      }
    }
    if ("primaryAxisAlignItems" in node) {
      const pa = node.primaryAxisAlignItems;
      if (pa === "CENTER") css["justify-content"] = "center";
      else if (pa === "MAX") css["justify-content"] = "flex-end";
      else if (pa === "SPACE_BETWEEN") css["justify-content"] = "space-between";
    }
    if ("counterAxisAlignItems" in node) {
      const ca = node.counterAxisAlignItems;
      if (ca === "CENTER") css["align-items"] = "center";
      else if (ca === "MAX") css["align-items"] = "flex-end";
    }
  }

  // --- クリップ ---
  if ("clipsContent" in node && node.clipsContent) {
    css["overflow"] = "hidden";
  }

  // --- テキスト ---
  if (node.type === "TEXT") {
    data.text = node.characters;
    // テキストは固定幅にしない（親の flexbox で制御）
    delete css["width"];
    delete css["height"];
    const textNode = node as TextNode;

    // フォント
    if (typeof textNode.fontSize === "number") {
      css["font-size"] = textNode.fontSize + "px";
    }
    if (textNode.fontName && typeof textNode.fontName === "object" && "family" in textNode.fontName) {
      css["font-family"] = "'" + textNode.fontName.family + "', sans-serif";
      const style = textNode.fontName.style;
      if (style.indexOf("Bold") >= 0) css["font-weight"] = "700";
      else if (style.indexOf("Semi") >= 0) css["font-weight"] = "600";
      else if (style.indexOf("Medium") >= 0) css["font-weight"] = "500";
      else css["font-weight"] = "400";
      if (style.indexOf("Italic") >= 0) css["font-style"] = "italic";
    }
    if (textNode.lineHeight && typeof textNode.lineHeight === "object" && "value" in textNode.lineHeight) {
      css["line-height"] = textNode.lineHeight.value + (textNode.lineHeight.unit === "PERCENT" ? "%" : "px");
    }
    if (textNode.letterSpacing && typeof textNode.letterSpacing === "object" && "value" in textNode.letterSpacing) {
      if (textNode.letterSpacing.value !== 0) {
        css["letter-spacing"] = textNode.letterSpacing.value + "px";
      }
    }
    // テキスト色
    if (Array.isArray(textNode.fills) && textNode.fills.length > 0) {
      const f = textNode.fills[0];
      if (f.type === "SOLID" && f.visible !== false) {
        css["color"] = rgbToHex(f.color.r, f.color.g, f.color.b);
      }
    }
    // テキスト揃え
    if (textNode.textAlignHorizontal === "CENTER") css["text-align"] = "center";
    else if (textNode.textAlignHorizontal === "RIGHT") css["text-align"] = "right";
  }

  // --- 子ノード ---
  if ("children" in node) {
    const frameNode = node as FrameNode;
    const kids: FigmaNodeData[] = [];
    for (const child of frameNode.children) {
      const childData = extractNodeTree(child, depth + 1);
      if (childData) kids.push(childData);
    }
    if (kids.length > 0) data.children = kids;
  }

  return data;
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

      // バリアントごとのノードツリーを抽出
      const variantTrees: Record<string, FigmaNodeData> = {};
      for (const child of node.children) {
        if (child.type !== "COMPONENT") continue;
        const tree = extractNodeTree(child, 0);
        if (tree) variantTrees[child.name] = tree;
      }

      // デフォルトバリアント（最初の子）のツリーをメインに使用
      const defaultChild = node.children[0];
      const nodeTree = defaultChild ? extractNodeTree(defaultChild, 0) : undefined;

      components.push({
        id: node.id,
        name: node.name,
        description: node.description || "",
        variants,
        props,
        nodeTree: nodeTree || undefined,
        variantTrees: variantTrees,
      } as ExtractedComponent & { variantTrees: Record<string, FigmaNodeData> });
    } else if (node.type === "COMPONENT") {
      // 単体コンポーネント — ノードツリー抽出
      const nodeTree = extractNodeTree(node, 0);

      components.push({
        id: node.id,
        name: node.name,
        description: node.description || "",
        variants: {},
        props: [],
        nodeTree: nodeTree || undefined,
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
      let spacingCreated = 0;
      let spacingUpdated = 0;
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
            spacingCreated++;
          } else {
            spacingUpdated++;
          }
          variable.setValueForMode(modeId, val);
        }
      }

      // Typography Text Styles を作成/更新
      let typoCreated = 0;
      let typoUpdated = 0;
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
            typoCreated++;
          } else {
            typoUpdated++;
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

      // コンポーネント Description を同期
      let compSynced = 0;
      if (data.components && Array.isArray(data.components)) {
        figma.ui.postMessage({ type: "status", message: "コンポーネント情報を同期中...", level: "info" });

        const allComps = figma.root.findAllWithCriteria({
          types: ["COMPONENT", "COMPONENT_SET"],
        });

        // 名前→ノードのマップ（小文字で照合）
        const compMap: Record<string, (ComponentNode | ComponentSetNode)[]> = {};
        for (const node of allComps) {
          const key = node.name.toLowerCase().replace(/\s+/g, "");
          if (!compMap[key]) compMap[key] = [];
          compMap[key].push(node);
        }

        for (const meta of data.components as Array<{ name: string; description: string; category: string; variants?: string[] }>) {
          const key = meta.name.toLowerCase().replace(/\s+/g, "");
          const nodes = compMap[key];
          if (!nodes) continue;

          for (const node of nodes) {
            node.description = meta.description;
            compSynced++;
          }
        }

        figma.ui.postMessage({ type: "status", message: compSynced + " コンポーネントの情報を同期", level: "info" });
      }

      // 詳細な同期結果を表示
      const details: string[] = [];
      details.push("Color: " + (colorCreated + colorUpdated) + " (" + colorCreated + " 新規)");
      details.push("Spacing: " + (spacingCreated + spacingUpdated) + " (" + spacingCreated + " 新規)");
      details.push("Typography: " + (typoCreated + typoUpdated) + " (" + typoCreated + " 新規)");
      details.push("Components: " + compSynced + " 件同期");

      figma.ui.postMessage({
        type: "import-result",
        success: true,
        message: details.join(" / "),
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
