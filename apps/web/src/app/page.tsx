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
import { ComponentRenderer } from "@/components/ComponentRenderer";
import { TokenViewer } from "@/components/TokenViewer";
import { useCatalog } from "@/lib/use-catalog";
import {
  sidebarItems as demoSidebarItems,
  componentProps,
  componentDescriptions,
  generateCode,
} from "@/lib/demo-data";

const tokenViews = ["colors", "typography", "spacing"] as const;

// Figmaコンポーネント名→MUIコンポーネントIDのマッピング
const FIGMA_TO_RENDERER: Record<string, string> = {
  Button: "button",
  Chip: "chip",
  Alert: "alert",
  Badge: "badge",
  Switch: "switch",
  Divider: "divider",
};

// Figmaには含まれないがレンダリングに必要なテキスト/コンテンツProps
const REQUIRED_TEXT_PROPS: Record<string, PropDefinition[]> = {
  Button: [{ name: "label", type: "string", defaultValue: "ボタン" }],
  Chip: [{ name: "label", type: "string", defaultValue: "チップ" }],
  Alert: [{ name: "message", type: "string", defaultValue: "これはアラートメッセージです。" }],
  Badge: [{ name: "count", type: "number", defaultValue: 4, min: 0, max: 99 }],
  Switch: [{ name: "label", type: "string", defaultValue: "通知" }],
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>("button");
  const [propValues, setPropValues] = useState<Record<string, Record<string, unknown>>>({});
  const [inspectActive, setInspectActive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { catalog } = useCatalog();

  // Figmaカタログからトップレベルコンポーネントを抽出してサイドバーに追加
  const { sidebarItems, figmaComponents } = useMemo(() => {
    const figmaComps: { id: string; name: string; description: string; props: PropDefinition[]; variantCount: number }[] = [];

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
        });
      }
    }

    const catalogItems: SidebarItem[] = figmaComps.map((c) => ({
      id: c.id,
      label: c.name,
      category: "Catalog",
    }));

    return {
      sidebarItems: [...catalogItems, ...demoSidebarItems],
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

  const isTokenView =
    selectedId && tokenViews.includes(selectedId as (typeof tokenViews)[number]);
  const isScannedView = selectedId === "sync-log";
  const isComponentView = selectedId && !isTokenView && !isScannedView && !isFigmaView;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  // FigmaコンポーネントのレンダラーID
  const figmaRendererId = activeFigma ? FIGMA_TO_RENDERER[activeFigma.name] : undefined;

  // バリアント一覧を自動生成（demo + figma対応）
  const variants = useMemo<VariantItem[]>(() => {
    // FigmaコンポーネントのレンダラーIDで既存バリアントマップを参照
    const lookupId = figmaRendererId || selectedId;
    if (!lookupId || !componentProps[lookupId]) return [];

    const variantMap: Record<string, VariantItem[]> = {
      button: [
        { label: "contained / primary", node: <Button variant="contained" color="primary">Button</Button> },
        { label: "contained / secondary", node: <Button variant="contained" color="secondary">Button</Button> },
        { label: "contained / error", node: <Button variant="contained" color="error">Button</Button> },
        { label: "outlined / primary", node: <Button variant="outlined" color="primary">Button</Button> },
        { label: "outlined / secondary", node: <Button variant="outlined" color="secondary">Button</Button> },
        { label: "text / primary", node: <Button variant="text" color="primary">Button</Button> },
        { label: "small", node: <Button variant="contained" size="small">Small</Button> },
        { label: "large", node: <Button variant="contained" size="large">Large</Button> },
        { label: "disabled", node: <Button variant="contained" disabled>Disabled</Button> },
      ],
      chip: [
        { label: "filled / primary", node: <Chip label="Chip" color="primary" /> },
        { label: "filled / secondary", node: <Chip label="Chip" color="secondary" /> },
        { label: "filled / success", node: <Chip label="Chip" color="success" /> },
        { label: "filled / error", node: <Chip label="Chip" color="error" /> },
        { label: "outlined / primary", node: <Chip label="Chip" variant="outlined" color="primary" /> },
        { label: "outlined / secondary", node: <Chip label="Chip" variant="outlined" color="secondary" /> },
        { label: "small", node: <Chip label="Chip" size="small" /> },
      ],
      alert: [
        { label: "success", node: <Alert severity="success" sx={{ minWidth: 160 }}>Success</Alert> },
        { label: "info", node: <Alert severity="info" sx={{ minWidth: 160 }}>Info</Alert> },
        { label: "warning", node: <Alert severity="warning" sx={{ minWidth: 160 }}>Warning</Alert> },
        { label: "error", node: <Alert severity="error" sx={{ minWidth: 160 }}>Error</Alert> },
        { label: "filled / success", node: <Alert severity="success" variant="filled" sx={{ minWidth: 160 }}>Filled</Alert> },
        { label: "outlined / error", node: <Alert severity="error" variant="outlined" sx={{ minWidth: 160 }}>Outlined</Alert> },
      ],
    };

    return variantMap[lookupId] || [];
  }, [selectedId, figmaRendererId]);

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
          {isTokenView && (
            <TokenViewer
              viewType={selectedId as "colors" | "typography" | "spacing"}
              alerts={[
                {
                  type: "warning",
                  message:
                    "Figmaバリアブルコレクション: ダークモードのトークンが一部未定義です。",
                },
              ]}
            />
          )}

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
                {figmaRendererId ? (
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
