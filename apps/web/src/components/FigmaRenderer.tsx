"use client";

// Figma ノードツリー → HTML/CSS 完全再現レンダラー
// Figma のレイヤー構造をそのままブラウザの DOM に変換する

import { CSSProperties } from "react";

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
  for (const [key, value] of Object.entries(css)) {
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

// バリアント比較グリッド
interface FigmaVariantGridProps {
  variantTrees: Record<string, FigmaNodeData>;
}

export function FigmaVariantGrid({ variantTrees }: FigmaVariantGridProps) {
  const entries = Object.entries(variantTrees);
  if (entries.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      {entries.map(([variantName, tree]) => (
        <div
          key={variantName}
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80px",
              padding: "16px",
              backgroundColor: "#fafafa",
            }}
          >
            <FigmaRenderer nodeTree={tree} />
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid #e0e0e0",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#666",
            }}
          >
            {variantName}
          </div>
        </div>
      ))}
    </div>
  );
}
