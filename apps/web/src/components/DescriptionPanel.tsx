"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import type { ComponentDescription } from "@/lib/demo-data";

// インライン: `code` と **bold**
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const t = match[0];
    if (t.startsWith("`")) {
      parts.push(
        <Box
          key={match.index}
          component="code"
          sx={{
            px: 0.5,
            py: 0.125,
            borderRadius: 0.5,
            bgcolor: "action.hover",
            fontSize: "0.75rem",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {t.slice(1, -1)}
        </Box>
      );
    } else {
      parts.push(
        <strong key={match.index}>{t.slice(2, -2)}</strong>
      );
    }
    lastIndex = match.index + t.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// Markdown簡易レンダリング
function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return null;

    // **見出し**
    const h = line.match(/^\*\*(.+?)\*\*$/);
    if (h) {
      return (
        <Typography key={i} variant="subtitle2" sx={{ mt: i > 0 ? 2 : 0, mb: 0.5 }}>
          {h[1]}
        </Typography>
      );
    }

    // - リスト
    const li = line.match(/^- (.+)$/);
    if (li) {
      return (
        <Typography key={i} variant="body2" color="text.secondary" sx={{ pl: 2, lineHeight: 1.8 }}>
          &#x2022; {renderInline(li[1])}
        </Typography>
      );
    }

    return (
      <Typography key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        {renderInline(line)}
      </Typography>
    );
  });
}

export function DescriptionPanel({ description }: { description: ComponentDescription }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 使い方 */}
      {description.usage && (
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: "block" }}>
            使い方
          </Typography>
          {renderMarkdown(description.usage)}
        </Box>
      )}

      {/* ガイドライン */}
      {description.guidelines && description.guidelines.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: "block" }}>
              ガイドライン
            </Typography>
            {description.guidelines.map((g, i) => (
              <Typography key={i} variant="body2" color="text.secondary" sx={{ pl: 2, lineHeight: 1.8 }}>
                &#x2022; {renderInline(g)}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
