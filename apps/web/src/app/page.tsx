"use client";

import { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Preview, VariantItem } from "@/components/Preview";
import { PropsPanel } from "@/components/PropsPanel";
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

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>("button");
  const [propValues, setPropValues] = useState<Record<string, Record<string, unknown>>>({});
  const [inspectActive, setInspectActive] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { catalog } = useCatalog();

  // デモ項目をそのまま使用（Scannedはテーブル表示に統合済み）
  const sidebarItems = demoSidebarItems;

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

  const currentProps = selectedId ? componentProps[selectedId] || [] : [];
  const currentValues = selectedId ? propValues[selectedId] || {} : {};

  const mergedValues: Record<string, unknown> = {};
  for (const prop of currentProps) {
    mergedValues[prop.name] = currentValues[prop.name] ?? prop.defaultValue;
  }

  const isTokenView =
    selectedId && tokenViews.includes(selectedId as (typeof tokenViews)[number]);
  const isScannedView = selectedId === "scanned";
  const isComponentView = selectedId && !isTokenView && !isScannedView;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  // バリアント一覧を自動生成
  const variants = useMemo<VariantItem[]>(() => {
    if (!selectedId || !componentProps[selectedId]) return [];

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

    return variantMap[selectedId] || [];
  }, [selectedId]);

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

            return (
              <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflow: "auto" }}>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  Scanned Components
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {items.length} コンポーネント
                  {figmaCount > 0 && ` (Figma: ${figmaCount})`}
                  {cliCount > 0 && ` (CLI: ${cliCount})`}
                  {catalog.generatedAt && ` — ${new Date(catalog.generatedAt).toLocaleString("ja-JP")}`}
                </Typography>

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 100px 80px 80px",
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
                  </Box>
                  {items.map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 80px 80px",
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
