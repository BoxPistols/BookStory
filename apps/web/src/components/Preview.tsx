"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useRef, useCallback, ReactNode, Component, ErrorInfo } from "react";
import { DescriptionPanel } from "./DescriptionPanel";
import { CodeBlock } from "./CodeBlock";
import { InspectOverlay, InspectedElement } from "./InspectOverlay";
import { InspectPanel } from "./InspectPanel";
import type { ComponentDescription } from "@/lib/demo-data";

export interface VariantItem {
  label: string;
  node: ReactNode;
}

interface PreviewProps {
  title: string;
  children: ReactNode;
  code?: string;
  figmaStatus?: "synced" | "outdated" | "missing";
  description?: ComponentDescription;
  variants?: VariantItem[];
  onInspectChange?: (active: boolean) => void;
  renderMode?: "figma" | "mui";
}

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Preview render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" variant="outlined" sx={{ m: 2, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            コンポーネントの描画でエラーが発生しました
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {this.state.error?.message || "不明なエラー"}
          </Typography>
        </Alert>
      );
    }
    return this.props.children;
  }
}

// --- Variants Grid ---
function VariantsGrid({ variants }: { variants: VariantItem[] }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 2,
      }}
    >
      {variants.map((v) => (
        <Paper
          key={v.label}
          variant="outlined"
          sx={{
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
            <PreviewErrorBoundary resetKey={v.label}>{v.node}</PreviewErrorBoundary>
          </Box>
          <Box sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: "divider" }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "text.secondary",
              }}
            >
              {v.label}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

// --- Tab index management ---
// Dynamic tabs: Preview(0), Variants(if non-empty), Code, Docs(if exists)
interface TabDef {
  key: string;
  label: string;
}

export function Preview({ title, children, code, figmaStatus, description, variants, onInspectChange, renderMode }: PreviewProps) {
  const [activeTabKey, setActiveTabKey] = useState("preview");
  const [inspectMode, setInspectMode] = useState(false);
  const [inspectedElement, setInspectedElement] = useState<InspectedElement | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const statusMap = {
    synced: { label: "同期済み", color: "success" as const },
    outdated: { label: "更新あり", color: "warning" as const },
    missing: { label: "未接続", color: "default" as const },
  };
  const status = figmaStatus ? statusMap[figmaStatus] : null;

  const handleInspect = useCallback((el: InspectedElement | null) => {
    setInspectedElement(el);
  }, []);

  const toggleInspect = () => {
    const next = !inspectMode;
    setInspectMode(next);
    onInspectChange?.(next);
    if (!next) {
      setInspectedElement(null);
    }
    if (next && activeTabKey !== "preview") {
      setActiveTabKey("preview");
    }
  };

  // 動的タブ構築: バリアントが空なら非表示、ドキュメントなしなら非表示
  const tabs: TabDef[] = [
    { key: "preview", label: "プレビュー" },
  ];
  if (variants && variants.length > 0) {
    tabs.push({ key: "variants", label: "バリアント" });
  }
  tabs.push({ key: "code", label: "コード" });
  if (description?.usage) {
    tabs.push({ key: "docs", label: "ドキュメント" });
  }

  const activeTabIndex = Math.max(0, tabs.findIndex((t) => t.key === activeTabKey));

  return (
    <>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ px: { xs: 2, md: 5 }, py: 4, maxWidth: 960 }}>
          {/* タイトル */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="h5">{title}</Typography>
            {status && (
              <Chip label={status.label} color={status.color} size="small" variant="outlined" />
            )}
            {renderMode === "mui" && (
              <Chip label="MUI近似" size="small" variant="outlined" color="info" />
            )}
          </Box>

          {description?.summary && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
              {description.summary}
            </Typography>
          )}

          {figmaStatus === "outdated" && (
            <Alert severity="warning" variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
              Figma上で変更が検出されました。プラグインの「公開」ボタンで反映してください。
            </Alert>
          )}

          {/* タブ + Inspect トグル */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Tabs
              value={activeTabIndex}
              onChange={(_, v) => setActiveTabKey(tabs[v].key)}
              sx={{ flex: 1, "& .MuiTab-root": { minWidth: 0, px: 0, mr: 2 } }}
            >
              {tabs.map((t) => (
                <Tab key={t.key} label={t.label} />
              ))}
            </Tabs>

            <Tooltip title={inspectMode ? "Inspect OFF" : "要素を検証"} arrow>
              <ToggleButton
                value="inspect"
                selected={inspectMode}
                onChange={toggleInspect}
                size="small"
                sx={{
                  border: 1,
                  borderColor: inspectMode ? "primary.main" : "divider",
                  borderRadius: 1.5,
                  width: 32,
                  height: 32,
                  color: inspectMode ? "primary.main" : "text.secondary",
                  bgcolor: inspectMode ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  "&:hover": {
                    bgcolor: inspectMode
                      ? alpha(theme.palette.primary.main, 0.12)
                      : "action.hover",
                  },
                }}
              >
                <SearchIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
            </Tooltip>
          </Box>

          {activeTabKey === "preview" && (
            <Paper
              ref={previewRef}
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 200,
                borderRadius: 2,
                bgcolor: "background.default",
                p: 4,
                position: "relative",
                cursor: inspectMode ? "crosshair" : "default",
                userSelect: inspectMode ? "none" : "auto",
              }}
            >
              <PreviewErrorBoundary resetKey={title}>{children}</PreviewErrorBoundary>
              <InspectOverlay
                containerRef={previewRef}
                active={inspectMode && activeTabKey === "preview"}
                onInspect={handleInspect}
              />
            </Paper>
          )}

          {activeTabKey === "variants" && variants && (
            <VariantsGrid variants={variants} />
          )}

          {activeTabKey === "code" && (
            <CodeBlock code={code || "// コードが生成されていません"} />
          )}

          {activeTabKey === "docs" && description && <DescriptionPanel description={description} />}
        </Box>
      </Box>

      {/* Inspect パネル（Propsパネルの代わりに表示） */}
      {inspectMode && inspectedElement && <InspectPanel element={inspectedElement} />}
    </>
  );
}
