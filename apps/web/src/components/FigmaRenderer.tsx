"use client";

// Figma ノードツリー → HTML/CSS 完全再現レンダラー
// Figma のレイヤー構造をそのままブラウザの DOM に変換する

import { CSSProperties } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface FigmaNodeData {
  type: string;
  name: string;
  css: Record<string, string>;
  text?: string;
  children?: FigmaNodeData[];
}

// CSS キー (kebab-case) → React style (camelCase) 変換
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, function (_, c) {
    return c.toUpperCase();
  });
}

function cssToStyle(css: Record<string, string>): CSSProperties {
  const style: Record<string, string> = {};
  // Auto Layout コンテナは主軸方向の固定サイズを min に変換（潰れ防止）
  const isColumnFlex = css["display"] === "flex" && css["flex-direction"] === "column";
  const isRowFlex = css["display"] === "flex" && css["flex-direction"] === "row";

  for (const [key, value] of Object.entries(css)) {
    if (isColumnFlex && key === "height") {
      style["minHeight"] = value;
      style["height"] = "auto";
      continue;
    }
    if (isRowFlex && key === "width") {
      style["minWidth"] = value;
      style["width"] = "auto";
      continue;
    }
    style[toCamelCase(key)] = value;
  }
  return style as CSSProperties;
}

// 単一ノードをレンダリング
function RenderNode({ node, depth }: { node: FigmaNodeData; depth: number }) {
  if (depth > 10) return null;

  const style = cssToStyle(node.css);

  // テキストノード
  if (node.type === "TEXT" && node.text !== undefined) {
    return (
      <span style={style} data-figma-name={node.name}>
        {node.text}
      </span>
    );
  }

  // 楕円
  if (node.type === "ELLIPSE") {
    return (
      <div
        style={{ ...style, borderRadius: "50%" }}
        data-figma-name={node.name}
      />
    );
  }

  // コンテナノード（FRAME, RECTANGLE, COMPONENT, INSTANCE, GROUP 等）
  return (
    <div style={style} data-figma-name={node.name}>
      {node.children?.map((child, i) => (
        <RenderNode key={child.name + "-" + i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// メインコンポーネント
interface FigmaRendererProps {
  nodeTree: FigmaNodeData;
}

export function FigmaRenderer({ nodeTree }: FigmaRendererProps) {
  return (
    <div data-figma-root={nodeTree.name} style={{ display: "inline-block" }}>
      <RenderNode node={nodeTree} depth={0} />
    </div>
  );
}

// バリアント比較グリッド（MUIテーマ対応）
interface FigmaVariantGridProps {
  variantTrees: Record<string, FigmaNodeData>;
}

export function FigmaVariantGrid({ variantTrees }: FigmaVariantGridProps) {
  const entries = Object.entries(variantTrees);
  if (entries.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 2,
      }}
    >
      {entries.map(([variantName, tree]) => (
        <Box
          key={variantName}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
              p: 2,
              bgcolor: "background.default",
            }}
          >
            <FigmaRenderer nodeTree={tree} />
          </Box>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "text.secondary",
              }}
            >
              {variantName}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
