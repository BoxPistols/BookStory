"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import type { DesignToken, ColorValue } from "@bookstory/core";

interface FigmaTokenViewProps {
  tokenType: string;
  tokens: DesignToken[];
}

export function FigmaTokenView({ tokenType, tokens }: FigmaTokenViewProps) {
  const filtered = tokens.filter((t) => t.type === tokenType);

  return (
    <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {tokenType === "color" ? "Color Tokens" : tokenType === "typography" ? "Typography Tokens" : "Spacing Tokens"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {filtered.length} トークン — Figma Variables から取得
      </Typography>

      {tokenType === "color" && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(auto-fill, minmax(120px, 1fr))", md: "repeat(auto-fill, minmax(160px, 1fr))" }, gap: 2 }}>
          {filtered.map((t) => {
            const val = t.value as ColorValue;
            const hex = typeof val === "string" ? val
              : val && typeof val === "object" && typeof val.r === "number"
                ? `#${Math.round(val.r * 255).toString(16).padStart(2, "0")}${Math.round((val.g ?? 0) * 255).toString(16).padStart(2, "0")}${Math.round((val.b ?? 0) * 255).toString(16).padStart(2, "0")}`
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

      {tokenType === "typography" && (
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

      {tokenType === "spacing" && (
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
}
