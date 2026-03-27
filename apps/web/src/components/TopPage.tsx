"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { getShortcutHints } from "@/lib/use-keyboard-nav";

interface TopPageProps {
  tokenCounts: { color: number; typography: number; spacing: number };
  components: { name: string; id: string; description: string }[];
  onSelect: (id: string) => void;
}

export function TopPage({ tokenCounts, components, onSelect }: TopPageProps) {
  const hints = getShortcutHints();

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>

        {/* ヘッダー */}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          BookStory
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
          Figma で作成したコンポーネントをブラウザ上で完全再現するカタログ。
          デザイナーは Figma だけを触り、エンジニアはこのカタログでデザイン仕様を確認できる。
        </Typography>

        {/* トークンサマリー */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", fontSize: "0.6875rem" }}>
          Tokens
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 5 }}>
          {[
            { label: "Color", count: tokenCounts.color, id: "figma-token-color", color: "#2642be" },
            { label: "Typography", count: tokenCounts.typography, id: "figma-token-typography", color: "#46ab4a" },
            { label: "Spacing", count: tokenCounts.spacing, id: "figma-token-spacing", color: "#eb8117" },
          ].map((t) => (
            <Paper
              key={t.label}
              variant="outlined"
              onClick={() => onSelect(t.id)}
              sx={{
                p: 2.5,
                borderRadius: 2,
                cursor: "pointer",
                transition: "border-color 0.15s, box-shadow 0.15s",
                "&:hover": { borderColor: "primary.main", boxShadow: "0 2px 12px rgba(38,66,190,0.08)" },
              }}
            >
              <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: t.color }}>{t.count}</Typography>
              <Typography variant="body2" color="text.secondary">{t.label}</Typography>
            </Paper>
          ))}
        </Box>

        {/* コンポーネント一覧 */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", fontSize: "0.6875rem" }}>
          Components ({components.length})
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5, mb: 5 }}>
          {components.map((c) => (
            <Paper
              key={c.id}
              variant="outlined"
              onClick={() => onSelect(c.id)}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 1.5,
                cursor: "pointer",
                transition: "border-color 0.15s",
                "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
              {c.description && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, lineHeight: 1.4 }}>
                  {c.description.split("\n")[0].slice(0, 40)}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>

        {/* ショートカット */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em", color: "text.secondary", fontSize: "0.6875rem" }}>
          Keyboard Shortcuts
        </Typography>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {[
            { keys: hints.prev, desc: "前のコンポーネント" },
            { keys: hints.next, desc: "次のコンポーネント" },
            { keys: "/", desc: "検索" },
          ].map((s) => (
            <Box key={s.keys} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label={s.keys} size="small" variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }} />
              <Typography variant="caption" color="text.secondary">{s.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
