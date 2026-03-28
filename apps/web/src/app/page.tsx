"use client";

import { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { Sidebar, SidebarItem } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Preview, VariantItem } from "@/components/Preview";
import { PropsPanel, PropDefinition } from "@/components/PropsPanel";
import { ComponentRenderer, REGISTERED_COMPONENTS } from "@/components/ComponentRenderer";
import { FigmaRenderer } from "@/components/FigmaRenderer";
import type { FigmaNodeData } from "@/components/FigmaRenderer";
import { useCatalog } from "@/lib/use-catalog";
import { useKeyboardNav } from "@/lib/use-keyboard-nav";
import { TopPage } from "@/components/TopPage";
import { FigmaTokenView } from "@/components/FigmaTokenView";
import { SyncLogView } from "@/components/SyncLogView";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import type { DesignToken } from "@bookstory/core";
import {
  sidebarItems as demoSidebarItems,
  componentProps,
  componentDescriptions,
  generateCode,
} from "@/lib/demo-data";

// Figmaコンポーネント名→レンダラーID自動マッチ（レジストリに登録済みなら自動対応）
const REGISTERED_SET = new Set(REGISTERED_COMPONENTS);
function figmaToRenderer(name: string): string | undefined {
  const id = name.toLowerCase().replace(/\s+/g, "");
  return REGISTERED_SET.has(id) ? id : undefined;
}

// Figmaには含まれないがレンダリングに必要なテキスト/コンテンツProps
const REQUIRED_TEXT_PROPS: Record<string, PropDefinition[]> = {
  Button: [{ name: "label", type: "string", defaultValue: "ボタン" }],
  Chip: [{ name: "label", type: "string", defaultValue: "チップ" }],
  Alert: [{ name: "message", type: "string", defaultValue: "これはアラートメッセージです。" }],
  Badge: [{ name: "count", type: "number", defaultValue: 4, min: 0, max: 99 }],
  Switch: [{ name: "label", type: "string", defaultValue: "通知" }],
  Dialog: [
    { name: "title", type: "string", defaultValue: "確認" },
    { name: "message", type: "string", defaultValue: "この操作を実行しますか？" },
    { name: "action", type: "string", defaultValue: "確認" },
  ],
  Snackbar: [{ name: "message", type: "string", defaultValue: "操作が完了しました" }],
  Accordion: [{ name: "title", type: "string", defaultValue: "セクション 1" }],
  Stepper: [{ name: "step", type: "number", defaultValue: 1, min: 0, max: 2 }],
};

// URL ハッシュから初期選択を復元
function getInitialId(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  return hash || null;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(getInitialId);
  const [propValues, setPropValues] = useState<Record<string, Record<string, unknown>>>({});
  const [inspectActive, setInspectActive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { catalog, error } = useCatalog();

  // Figmaカタログからトップレベルコンポーネントを抽出してサイドバーに追加
  const { sidebarItems, figmaComponents, tokens } = useMemo(() => {
    const figmaComps: { id: string; name: string; description: string; props: PropDefinition[]; variantCount: number; variants?: Record<string, string[]>; nodeTree?: unknown }[] = [];
    const allTokens: DesignToken[] = [];

    if (catalog) {
      // トップレベルコンポーネントのみ（バリアント "=" と子コンポーネント "/" を除外）
      const topLevel = catalog.components.filter((c) => !c.name.includes("=") && !c.name.includes("/"));
      for (const comp of topLevel) {
        const variantCount = catalog.components.filter(
          (v) => v.name.includes("=") && v.id.startsWith(comp.id.split(":")[0])
        ).length;
        // Figma propsをPropDefinition形式に変換
        const props: PropDefinition[] = (comp.props || []).map((p) => {
          const opts = "options" in p ? (p as { options?: string[] }).options : undefined;
          const lcOpts = opts?.map((o) => o.toLowerCase());
          return {
            name: p.name,
            type: (p.type === "select" ? "select" : "string") as PropDefinition["type"],
            defaultValue: p.defaultValue ? String(p.defaultValue).toLowerCase() : "",
            options: lcOpts,
          };
        });
        // テキストPropsを補完
        const textProps = REQUIRED_TEXT_PROPS[comp.name] || [];
        const existingNames = new Set(props.map((p) => p.name));
        for (const tp of textProps) {
          if (!existingNames.has(tp.name)) props.push(tp);
        }

        figmaComps.push({
          id: `figma-${comp.name.toLowerCase()}`,
          name: comp.name,
          description: comp.description || "",
          props,
          variantCount,
          variants: comp.variants,
          nodeTree: comp.nodeTree,
        });
      }

      if (catalog.tokens) allTokens.push(...catalog.tokens);
    }

    // コンポーネント項目
    const componentItems: SidebarItem[] = figmaComps.map((c) => ({
      id: c.id,
      label: c.name,
      category: "Components",
    }));

    // トークンカテゴリをFigmaデータから生成
    const tokenItems: SidebarItem[] = [];
    const tokenTypes = new Set(allTokens.map((t) => t.type));
    if (tokenTypes.has("color")) tokenItems.push({ id: "figma-token-color", label: "Color", category: "Tokens" });
    if (tokenTypes.has("typography")) tokenItems.push({ id: "figma-token-typography", label: "Typography", category: "Tokens" });
    if (tokenTypes.has("spacing")) tokenItems.push({ id: "figma-token-spacing", label: "Spacing", category: "Tokens" });

    return {
      sidebarItems: [...tokenItems, ...componentItems, ...demoSidebarItems],
      figmaComponents: figmaComps,
      tokens: allTokens,
    };
  }, [catalog]);

  const handlePropChange = useCallback(
    (name: string, value: unknown) => {
      if (!selectedId) return;
      setPropValues((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], [name]: value },
      }));
    },
    [selectedId]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setInspectActive(false);
    window.history.replaceState(null, "", "#" + id);
  }, []);

  // キーボードショートカット（Alt/Option + ← →）
  useKeyboardNav({ items: sidebarItems, selectedId, onSelect: handleSelect });

  const handleReset = useCallback(() => {
    if (!selectedId) return;
    setPropValues((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
  }, [selectedId]);

  // Figmaコンポーネントかどうか判定
  const activeFigma = figmaComponents.find((c) => c.id === selectedId);
  const isFigmaView = !!activeFigma;

  // Figmaコンポーネントの場合はFigma props、そうでなければdemo props
  const currentProps = isFigmaView
    ? activeFigma.props
    : selectedId ? componentProps[selectedId] || [] : [];
  const currentValues = selectedId ? propValues[selectedId] || {} : {};

  const mergedValues: Record<string, unknown> = {};
  for (const prop of currentProps) {
    mergedValues[prop.name] = currentValues[prop.name] ?? prop.defaultValue;
  }

  // ページ判定
  const isTopPage = !selectedId;
  const isFigmaTokenView = selectedId?.startsWith("figma-token-") ?? false;
  const figmaTokenType = isFigmaTokenView ? selectedId!.replace("figma-token-", "") : null;
  const isScannedView = selectedId === "sync-log";
  const isComponentView = selectedId && !isScannedView && !isFigmaView && !isFigmaTokenView;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  // FigmaコンポーネントのレンダラーID（レジストリ自動マッチ）
  const figmaRendererId = activeFigma ? figmaToRenderer(activeFigma.name) : undefined;

  // nodeTree の有無で FigmaRenderer vs ComponentRenderer を判定
  const hasNodeTree = activeFigma?.nodeTree && typeof activeFigma.nodeTree === "object" && "css" in (activeFigma.nodeTree as Record<string, unknown>);
  const renderMode: "figma" | "mui" | undefined = isFigmaView
    ? hasNodeTree ? "figma" : figmaRendererId ? "mui" : undefined
    : undefined;

  // 同期ステータスの動的判定
  const figmaStatus = useMemo<"synced" | "outdated" | "missing">(() => {
    if (!catalog?.generatedAt) return "missing";
    const syncedAt = new Date(catalog.generatedAt).getTime();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (syncedAt < oneHourAgo) return "outdated";
    return "synced";
  }, [catalog]);

  // バリアント一覧を Figma スキャンデータから自動生成
  const variants = useMemo<VariantItem[]>(() => {
    if (!activeFigma || !figmaRendererId) return [];

    const figmaVariants = activeFigma.variants || {};
    const variantKeys = Object.keys(figmaVariants);
    if (variantKeys.length === 0) return [];

    // 全バリアント組み合わせを列挙
    const combinations: Record<string, string>[] = [{}];
    for (const key of variantKeys) {
      const values = figmaVariants[key];
      const expanded: Record<string, string>[] = [];
      for (const combo of combinations) {
        for (const val of values) {
          expanded.push({ ...combo, [key.charAt(0).toLowerCase() + key.slice(1)]: val.toLowerCase() });
        }
      }
      combinations.length = 0;
      combinations.push(...expanded);
    }

    // 各組み合わせを MUI コンポーネントとしてレンダリング
    return combinations.slice(0, 24).map((combo) => {
      const label = Object.values(combo).join(" / ");
      return {
        label,
        node: <ComponentRenderer componentId={figmaRendererId} values={{ ...combo, label: activeFigma.name }} />,
      };
    });
  }, [activeFigma, figmaRendererId]);

  // Figma未接続でコンポーネントが0のとき
  const isEmpty = figmaComponents.length === 0 && (!catalog || catalog.components.length === 0);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        items={sidebarItems}
        selectedId={selectedId}
        onSelect={handleSelect}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header onMenuToggle={() => setMobileOpen(true)} />

        <Box sx={{ flex: 1, display: "flex", flexDirection: { xs: "column", md: "row" }, overflow: "hidden" }}>
          {/* トップページ or オンボーディング */}
          {isTopPage && (
            isEmpty ? (
              <OnboardingGuide error={error} />
            ) : (
              <TopPage
                tokenCounts={{
                  color: tokens.filter((t) => t.type === "color").length,
                  typography: tokens.filter((t) => t.type === "typography").length,
                  spacing: tokens.filter((t) => t.type === "spacing").length,
                }}
                components={figmaComponents.map((c) => ({ name: c.name, id: c.id, description: c.description }))}
                onSelect={handleSelect}
              />
            )
          )}

          {/* エラー表示（トップページ以外で） */}
          {error && !isTopPage && (
            <Alert severity="error" variant="outlined" sx={{ m: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Figma トークンビュー */}
          {isFigmaTokenView && figmaTokenType && (
            <FigmaTokenView tokenType={figmaTokenType} tokens={tokens} />
          )}

          {/* Figma コンポーネントビュー */}
          {isFigmaView && activeFigma && (
            <>
              <Preview
                title={activeFigma.name}
                code={figmaRendererId ? generateCode(figmaRendererId, mergedValues) : "// Figma コンポーネント"}
                figmaStatus={figmaStatus}
                description={
                  activeFigma.description
                    ? {
                        summary: activeFigma.description.split("\n")[0],
                        usage: activeFigma.description.includes("\n")
                          ? activeFigma.description.split("\n").slice(1).join("\n").trim()
                          : undefined,
                      }
                    : componentDescriptions[activeFigma.name.toLowerCase()]
                }
                variants={figmaRendererId ? variants : []}
                onInspectChange={setInspectActive}
                renderMode={renderMode}
              >
                {/* Figma ノードツリーがあれば完全再現、なければ MUI フォールバック */}
                {hasNodeTree ? (
                  <FigmaRenderer nodeTree={activeFigma.nodeTree as FigmaNodeData} />
                ) : figmaRendererId ? (
                  <ComponentRenderer
                    componentId={figmaRendererId}
                    values={mergedValues}
                  />
                ) : (
                  <Typography color="text.secondary">
                    プレビュー未対応のコンポーネント
                  </Typography>
                )}
              </Preview>

              {!inspectActive && (
                <PropsPanel
                  props={currentProps}
                  values={mergedValues}
                  onChange={handlePropChange}
                  onReset={handleReset}
                />
              )}
            </>
          )}

          {/* Sync Log ビュー */}
          {isScannedView && catalog && (
            <SyncLogView catalog={catalog} />
          )}

          {/* デモコンポーネントビュー */}
          {isComponentView && (
            <>
              <Preview
                title={sidebarItems.find((i) => i.id === selectedId)?.label || ""}
                code={generateCode(selectedId, mergedValues)}
                figmaStatus={figmaStatus}
                description={description}
                variants={variants}
                onInspectChange={setInspectActive}
              >
                <ComponentRenderer
                  componentId={selectedId}
                  values={mergedValues}
                />
              </Preview>

              {!inspectActive && (
                <PropsPanel
                  props={currentProps}
                  values={mergedValues}
                  onChange={handlePropChange}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
