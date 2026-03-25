"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { useCatalog } from "@/lib/use-catalog";

export default function CatalogPage() {
  const { catalog, loading } = useCatalog();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!catalog || catalog.components.length === 0) {
    return (
      <Box sx={{ p: 5, maxWidth: 600 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          カタログが見つかりません
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          CLIでスキャンを実行してください:
        </Typography>
        <Paper
          variant="outlined"
          sx={{ p: 2, borderRadius: 2, bgcolor: "background.default", fontFamily: "monospace", fontSize: "0.8125rem" }}
        >
          bookstory scan --dir src/components
        </Paper>
      </Box>
    );
  }

  const categories = [...new Set(catalog.components.map((c) => c.category))];

  return (
    <Box sx={{ p: 5, maxWidth: 960 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        スキャン結果
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {catalog.componentDir} から {catalog.components.length} コンポーネントを検出
      </Typography>
      {catalog.generatedAt && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: "block" }}>
          最終スキャン: {new Date(catalog.generatedAt).toLocaleString("ja-JP")}
        </Typography>
      )}

      {categories.map((cat) => (
        <Box key={cat} sx={{ mb: 4 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              mb: 1.5,
              display: "block",
            }}
          >
            {cat}
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {catalog.components
              .filter((c) => c.category === cat)
              .map((comp) => (
                <Paper
                  key={comp.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {comp.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {comp.filePath}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${comp.props.length} props`}
                    size="small"
                    variant="outlined"
                  />
                </Paper>
              ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
