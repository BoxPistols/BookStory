"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import type { Catalog } from "@bookstory/core";

interface SyncLogViewProps {
  catalog: Catalog;
}

export function SyncLogView({ catalog }: SyncLogViewProps) {
  // バリアントを親コンポーネントにグルーピング
  const grouped = new Map<string, { name: string; variants: number; props: number; source: string }>();
  for (const c of catalog.components) {
    const isVariant = c.name.includes("=");
    const source = c.filePath ? "CLI" : "Figma";
    if (isVariant) continue;
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
            display: { xs: "none", md: "grid" },
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
              display: { xs: "flex", md: "grid" },
              flexDirection: { xs: "column" },
              gridTemplateColumns: { md: "1fr 100px 80px 80px 140px" },
              px: 2,
              py: { xs: 1.5, md: 0.75 },
              gap: { xs: 0.5, md: 1 },
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
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { md: "right" } }}>
              {item.variants || "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { md: "right" } }}>
              {item.props}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: { md: "right" }, fontSize: "0.6875rem" }}
            >
              {syncTime}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
