"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import { useState, ReactNode } from "react";
import { DescriptionPanel } from "./DescriptionPanel";
import type { ComponentDescription } from "@/lib/demo-data";

interface PreviewProps {
  title: string;
  children: ReactNode;
  code?: string;
  figmaStatus?: "synced" | "outdated" | "missing";
  description?: ComponentDescription;
}

export function Preview({ title, children, code, figmaStatus, description }: PreviewProps) {
  const [tab, setTab] = useState(0);

  const statusMap = {
    synced: { label: "同期済み", color: "success" as const },
    outdated: { label: "更新あり", color: "warning" as const },
    missing: { label: "未接続", color: "default" as const },
  };
  const status = figmaStatus ? statusMap[figmaStatus] : null;

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ px: 5, py: 4, maxWidth: 960 }}>
        {/* タイトル */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography variant="h5">{title}</Typography>
          {status && (
            <Chip label={status.label} color={status.color} size="small" variant="outlined" />
          )}
        </Box>

        {/* 概要（Figma Description の1行目） */}
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

        {/* タブ */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, "& .MuiTab-root": { minWidth: 0, px: 0, mr: 2 } }}
        >
          <Tab label="プレビュー" />
          <Tab label="コード" />
          {description?.usage && <Tab label="ドキュメント" />}
        </Tabs>

        {tab === 0 && (
          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              borderRadius: 2,
              bgcolor: "background.default",
              p: 4,
            }}
          >
            {children}
          </Paper>
        )}

        {tab === 1 && (
          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, overflow: "hidden", bgcolor: "background.default" }}
          >
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2.5,
                fontSize: "0.75rem",
                fontFamily: "'JetBrains Mono', monospace",
                color: "text.primary",
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
              }}
            >
              {code || "// コードが生成されていません"}
            </Box>
          </Paper>
        )}

        {tab === 2 && description && <DescriptionPanel description={description} />}
      </Box>
    </Box>
  );
}
