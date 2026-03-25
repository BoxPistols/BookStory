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
import { useState, useRef, useCallback, ReactNode } from "react";
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
}

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
            {v.node}
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

export function Preview({ title, children, code, figmaStatus, description, variants, onInspectChange }: PreviewProps) {
  const [tab, setTab] = useState(0);
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
    if (next && tab !== 0) {
      setTab(0);
    }
  };

  return (
    <>
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ px: 5, py: 4, maxWidth: 960 }}>
          {/* タイトル */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="h5">{title}</Typography>
            {status && (
              <Chip label={status.label} color={status.color} size="small" variant="outlined" />
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
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ flex: 1, "& .MuiTab-root": { minWidth: 0, px: 0, mr: 2 } }}
            >
              <Tab label="プレビュー" />
              <Tab label="バリアント" />
              <Tab label="コード" />
              {description?.usage && <Tab label="ドキュメント" />}
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

          {tab === 0 && (
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
              {children}
              <InspectOverlay
                containerRef={previewRef}
                active={inspectMode && tab === 0}
                onInspect={handleInspect}
              />
            </Paper>
          )}

          {tab === 1 && variants && (
            <VariantsGrid variants={variants} />
          )}

          {tab === 2 && (
            <CodeBlock code={code || "// コードが生成されていません"} />
          )}

          {tab === 3 && description && <DescriptionPanel description={description} />}
        </Box>
      </Box>

      {/* Inspect パネル（Propsパネルの代わりに表示） */}
      {inspectMode && inspectedElement && <InspectPanel element={inspectedElement} />}
    </>
  );
}
