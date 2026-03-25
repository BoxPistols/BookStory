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
const DEMO_IDS = new Set(demoSidebarItems.map((i) => i.id));

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>("button");
  const [propValues, setPropValues] = useState<Record<string, Record<string, unknown>>>({});
  const [inspectActive, setInspectActive] = useState(false);
  const { catalog } = useCatalog();

  // デモ項目 + カタログ固有項目をマージ
  const sidebarItems = useMemo<SidebarItem[]>(() => {
    if (!catalog || catalog.components.length === 0) return demoSidebarItems;
    const catalogItems: SidebarItem[] = catalog.components
      .filter((c) => !DEMO_IDS.has(c.id))
      .map((c) => ({
        id: c.id,
        label: c.name,
        category: "Scanned",
      }));
    return [...demoSidebarItems, ...catalogItems];
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

  const currentProps = selectedId ? componentProps[selectedId] || [] : [];
  const currentValues = selectedId ? propValues[selectedId] || {} : {};

  const mergedValues: Record<string, unknown> = {};
  for (const prop of currentProps) {
    mergedValues[prop.name] = currentValues[prop.name] ?? prop.defaultValue;
  }

  const isTokenView =
    selectedId && tokenViews.includes(selectedId as (typeof tokenViews)[number]);
  const isCatalogOnly = selectedId && !DEMO_IDS.has(selectedId);
  const isComponentView = selectedId && !isTokenView && !isCatalogOnly;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  // カタログ項目の詳細情報
  const catalogComponent = useMemo(() => {
    if (!isCatalogOnly || !catalog) return null;
    return catalog.components.find((c) => c.id === selectedId) ?? null;
  }, [selectedId, isCatalogOnly, catalog]);

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
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header />

        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
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

          {isCatalogOnly && catalogComponent && (
            <Box sx={{ flex: 1, p: 5, overflow: "auto" }}>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {catalogComponent.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "'JetBrains Mono', monospace", mb: 3 }}
              >
                {catalogComponent.filePath}
              </Typography>

              {catalogComponent.props.length > 0 && (
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
                    <Typography variant="caption" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Props ({catalogComponent.props.length})
                    </Typography>
                  </Box>
                  {catalogComponent.props.map((p) => (
                    <Box
                      key={p.name}
                      sx={{
                        px: 2,
                        py: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 120 }}
                      >
                        {p.name}
                      </Typography>
                      <Chip label={p.type} size="small" variant="outlined" />
                      {p.required && (
                        <Chip label="required" size="small" color="warning" />
                      )}
                    </Box>
                  ))}
                </Paper>
              )}

              {catalogComponent.props.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Props なし
                </Typography>
              )}
            </Box>
          )}

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
