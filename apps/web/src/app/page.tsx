"use client";

import { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Sidebar, SidebarItem } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Preview, VariantItem } from "@/components/Preview";
import { PropsPanel, PropDefinition } from "@/components/PropsPanel";
import { ComponentRenderer, REGISTERED_COMPONENTS } from "@/components/ComponentRenderer";
import { FigmaRenderer, FigmaVariantGrid } from "@/components/FigmaRenderer";
import type { FigmaNodeData } from "@/components/FigmaRenderer";
import { TokenViewer } from "@/components/TokenViewer";
import { useCatalog } from "@/lib/use-catalog";
import {
  sidebarItems as demoSidebarItems,
  componentProps,
  componentDescriptions,
  generateCode,
} from "@/lib/demo-data";

const tokenViews = ["colors", "typography", "spacing"] as const;

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
  const { catalog } = useCatalog();

  // Figmaカタログからトップレベルコンポーネントを抽出してサイドバーに追加
  const { sidebarItems, figmaComponents } = useMemo(() => {
    const figmaComps: { id: string; name: string; description: string; props: PropDefinition[]; variantCount: number; variants?: Record<string, string[]> }[] = [];

    if (catalog) {
      const topLevel = catalog.components.filter((c) => !c.name.includes("="));
      for (const comp of topLevel) {
        const variantCount = catalog.components.filter(
          (v) => v.name.includes("=") && v.id.startsWith(comp.id.split(":")[0])
        ).length;
        // Figma propsをPropDefinition形式に変換（MUIは小文字のためlowercase）
        const props: PropDefinition[] = (comp.props || []).map((p) => {
          const opts = "options" in p ? (p as { options?: string[] }).options : undefined;
          const lcOpts = opts?.map((o) => o.toLowerCase());
          return {
            name: p.name,
            type: (p.type === "select" ? "select" : "string") as PropDefinition["type"],
            defaultValue: p.defaultValue ? p.defaultValue.toLowerCase() : "",
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
        });
      }
    }

    // コンポーネント項目
    const componentItems: SidebarItem[] = figmaComps.map((c) => ({
      id: c.id,
      label: c.name,
      category: "Components",
    }));

    // トークンカテゴリをFigmaデータから生成
    const tokenItems: SidebarItem[] = [];
    if (catalog) {
      const tokenTypes = new Set((catalog as { tokens?: { type: string }[] }).tokens?.map((t) => t.type) || []);
      if (tokenTypes.has("color")) tokenItems.push({ id: "figma-token-color", label: "Color", category: "Tokens" });
      if (tokenTypes.has("typography")) tokenItems.push({ id: "figma-token-typography", label: "Typography", category: "Tokens" });
      if (tokenTypes.has("spacing")) tokenItems.push({ id: "figma-token-spacing", label: "Spacing", category: "Tokens" });
    }

    return {
      sidebarItems: [...tokenItems, ...componentItems, ...demoSidebarItems],
      figmaComponents: figmaComps,
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

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setInspectActive(false);
    // URL ハッシュに保存（リロードで復元可能）
    window.history.replaceState(null, "", "#" + id);
  };

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

  // Figmaトークンビュー
  const isFigmaTokenView = selectedId?.startsWith("figma-token-") ?? false;
  const figmaTokenType = isFigmaTokenView ? selectedId!.replace("figma-token-", "") : null;
  const isScannedView = selectedId === "sync-log";
  // 旧Exampleのトークンビュー（削除済みだが安全のため残す）
  const isTokenView = false;
  const isComponentView = selectedId && !isTokenView && !isScannedView && !isFigmaView && !isFigmaTokenView;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  // FigmaコンポーネントのレンダラーID（レジストリ自動マッチ）
  const figmaRendererId = activeFigma ? figmaToRenderer(activeFigma.name) : undefined;

  // バリアント一覧を Figma スキャンデータから自動生成
  const variants = useMemo<VariantItem[]>(() => {
    if (!activeFigma || !figmaRendererId) return [];

    // Figma コンポーネントのバリアント情報から全組み合わせを生成
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
          {isFigmaTokenView && catalog && (() => {
            const allTokens = (catalog as { tokens?: { name: string; type: string; value: unknown; modes?: Record<string, unknown> }[] }).tokens || [];
            const filtered = allTokens.filter((t) => t.type === figmaTokenType);
            return (
              <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflow: "auto" }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  {figmaTokenType === "color" ? "Color Tokens" : figmaTokenType === "typography" ? "Typography Tokens" : "Spacing Tokens"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {filtered.length} トークン — Figma Variables から取得
                </Typography>

                {figmaTokenType === "color" && (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2 }}>
                    {filtered.map((t) => {
                      const val = t.value as { r?: number; g?: number; b?: number } | string;
                      const hex = typeof val === "string" ? val
                        : val && typeof val.r === "number"
                          ? `#${Math.round(val.r * 255).toString(16).padStart(2, "0")}${Math.round(val.g! * 255).toString(16).padStart(2, "0")}${Math.round(val.b! * 255).toString(16).padStart(2, "0")}`
                          : "#000";
                      return (
                        <Paper key={t.name} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                          <Box sx={{ height: 64, bgcolor: hex }} />
                          <Box sx={{ p: 1.5 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.75rem" }}>{t.name.split("/").pop()}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{hex}</Typography>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}

                {figmaTokenType === "typography" && (
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    {filtered.map((t) => {
                      const val = t.value as { fontSize?: number; fontWeight?: string; fontFamily?: string; lineHeight?: { value?: number } };
                      return (
                        <Box key={t.name} sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: "divider", display: "flex", alignItems: "baseline", gap: 2, "&:first-of-type": { borderTop: 0 } }}>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 160, fontSize: "0.6875rem" }}>
                            {t.name} / {val.fontSize}px
                          </Typography>
                          <Typography sx={{ fontWeight: val.fontWeight === "Bold" ? 700 : val.fontWeight === "Semi Bold" ? 600 : 400, fontSize: val.fontSize, fontFamily: val.fontFamily || "Inter", lineHeight: 1.4 }}>
                            The quick brown fox
                          </Typography>
                        </Box>
                      );
                    })}
                  </Paper>
                )}

                {figmaTokenType === "spacing" && (
                  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "120px 80px 1fr", px: 2, py: 1, bgcolor: "action.hover", gap: 1 }}>
                      <Typography variant="caption" fontWeight={700}>トークン</Typography>
                      <Typography variant="caption" fontWeight={700}>値</Typography>
                      <Typography variant="caption" fontWeight={700}>プレビュー</Typography>
                    </Box>
                    {filtered.map((t) => {
                      const val = typeof t.value === "number" ? t.value : 0;
                      return (
                        <Box key={t.name} sx={{ display: "grid", gridTemplateColumns: "120px 80px 1fr", px: 2, py: 1, borderTop: 1, borderColor: "divider", gap: 1, alignItems: "center" }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.75rem" }}>{t.name.split("/").pop()}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{val}px</Typography>
                          <Box sx={{ height: 8, width: val, bgcolor: "primary.main", borderRadius: 0.5 }} />
                        </Box>
                      );
                    })}
                  </Paper>
                )}
              </Box>
            );
          })()}

          {isFigmaView && activeFigma && (
            <>
              <Preview
                title={activeFigma.name}
                code={figmaRendererId ? generateCode(figmaRendererId, mergedValues) : "// Figma コンポーネント"}
                figmaStatus="synced"
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
              >
                {/* Figma ノードツリーがあれば完全再現、なければ MUI フォールバック */}
                {(activeFigma as Record<string, unknown>).nodeTree ? (
                  <FigmaRenderer nodeTree={(activeFigma as Record<string, unknown>).nodeTree as FigmaNodeData} />
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

          {isScannedView && catalog && (() => {
            // バリアントを親コンポーネントにグルーピング
            const grouped = new Map<string, { name: string; variants: number; props: number; source: string }>();
            for (const c of catalog.components) {
              // "Variant=Contained, Color=Primary, Size=Small" → 親はButton等
              const isVariant = c.name.includes("=");
              // Figma由来はfilePathが空、CLI由来はfilePath有
              const source = c.filePath ? "CLI" : "Figma";
              if (isVariant) continue; // バリアントはスキップ（親でカウント）
              const variantCount = catalog.components.filter(
                (v) => v.name.startsWith("Variant=") && v.id.startsWith(c.id.split(":")[0])
              ).length;
              grouped.set(c.id, {
                name: c.name,
                variants: variantCount,
                props: c.props.length,
                source,
              });
            }
            // バリアント名のものは親不明なので独立コンポーネントとしてカウントしない
            const items = Array.from(grouped.values());
            const figmaCount = items.filter((i) => i.source === "Figma").length;
            const cliCount = items.filter((i) => i.source === "CLI").length;

            const syncTime = catalog.generatedAt
              ? new Date(catalog.generatedAt).toLocaleString("ja-JP")
              : "—";

            return (
              <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflow: "auto" }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  Sync Log
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  最終同期: {syncTime}
                  {" — "}
                  {figmaCount > 0 && `Figma: ${figmaCount}`}
                  {cliCount > 0 && ` / CLI: ${cliCount}`}
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 80px 80px 140px",
                      px: 2,
                      py: 1,
                      bgcolor: "action.hover",
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption" fontWeight={700}>コンポーネント</Typography>
                    <Typography variant="caption" fontWeight={700}>ソース</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ textAlign: "right" }}>バリアント</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ textAlign: "right" }}>Props</Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ textAlign: "right" }}>更新日時</Typography>
                  </Box>
                  {items.map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 80px 80px 140px",
                        px: 2,
                        py: 0.75,
                        gap: 1,
                        borderTop: 1,
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                      <Chip
                        label={item.source}
                        size="small"
                        variant="outlined"
                        color={item.source === "Figma" ? "primary" : "default"}
                        sx={{ width: "fit-content", fontSize: "0.6875rem" }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                        {item.variants || "—"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "right" }}>
                        {item.props}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textAlign: "right", fontSize: "0.6875rem" }}
                      >
                        {syncTime}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            );
          })()}

          {isComponentView && (
            <>
              <Preview
                title={sidebarItems.find((i) => i.id === selectedId)?.label || ""}
                code={generateCode(selectedId, mergedValues)}
                figmaStatus="synced"
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

          {!selectedId && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              サイドバーからコンポーネントを選択してください
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
