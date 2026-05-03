"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import type { DesignToken, ColorValue } from "@bookstory/core";

interface FigmaTokenViewProps {
  tokenType: string;
  tokens: DesignToken[];
}

// {r,g,b,a?} または "#RRGGBB" を CSS カラー文字列へ。不正値は null。
function toCssColor(val: unknown): string | null {
  if (typeof val === "string") {
    return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(val) ? val : null;
  }
  if (!val || typeof val !== "object") return null;
  const v = val as { r?: unknown; g?: unknown; b?: unknown; a?: unknown };
  if (typeof v.r !== "number" || typeof v.g !== "number" || typeof v.b !== "number") return null;
  const r = Math.round(v.r * 255);
  const g = Math.round(v.g * 255);
  const b = Math.round(v.b * 255);
  const a = typeof v.a === "number" ? v.a : 1;
  if (a >= 1) {
    return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
  }
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

// Figma の lineHeight は { value, unit } か number。ratio と px 表示用の値を返す。
function extractLineHeight(
  lh: unknown,
  fontSize: number | undefined
): { ratio: number; display: string } {
  if (typeof lh === "number" && isFinite(lh) && lh > 0) {
    return { ratio: lh, display: `${lh.toFixed(2)}` };
  }
  if (lh && typeof lh === "object") {
    const v = lh as { value?: unknown; unit?: unknown };
    if (typeof v.value === "number") {
      if (v.unit === "PERCENT") {
        return { ratio: v.value / 100, display: `${Math.round(v.value)}%` };
      }
      if (v.unit === "PIXELS" && fontSize && fontSize > 0) {
        return { ratio: v.value / fontSize, display: `${Math.round(v.value)}px` };
      }
      return { ratio: 1.4, display: `${Math.round(v.value)}px` };
    }
  }
  return { ratio: 1.4, display: "auto" };
}

// 表示用ラベル（display）とサンプル Typography に渡せる CSS 値（css）を返す。
// PERCENT は em に換算してプレビューに反映できるようにする。
function extractLetterSpacing(ls: unknown): { display: string; css: string | undefined } | null {
  if (typeof ls === "number" && ls !== 0) {
    return { display: `${ls}px`, css: `${ls}px` };
  }
  if (ls && typeof ls === "object") {
    const v = ls as { value?: unknown; unit?: unknown };
    if (typeof v.value === "number" && v.value !== 0) {
      if (v.unit === "PERCENT") {
        return { display: `${v.value}%`, css: `${v.value / 100}em` };
      }
      return { display: `${v.value}px`, css: `${v.value}px` };
    }
  }
  return null;
}

const TITLES: Record<string, string> = {
  color: "Color Tokens",
  typography: "Typography Tokens",
  spacing: "Spacing Tokens",
};

// Spacing プレビューバーの最大表示幅（px）。実値はこれを超えないようクリップ
const SPACING_PREVIEW_MAX_PX = 320;

export function FigmaTokenView({ tokenType, tokens }: FigmaTokenViewProps) {
  const filtered = tokens.filter((t) => t.type === tokenType);

  return (
    <Box sx={{ flex: 1, p: { xs: 2, md: 5 }, overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {TITLES[tokenType] ?? "Tokens"}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {filtered.length} トークン — Figma Variables から取得
      </Typography>

      {filtered.length === 0 && (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, p: 4, textAlign: "center", bgcolor: "action.hover" }}
        >
          <Typography variant="body2" color="text.secondary">
            このタイプのトークンはまだ同期されていません。
            Figma でバリアブルを定義し「コードに反映する」を押してください。
          </Typography>
        </Paper>
      )}

      {tokenType === "color" && filtered.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(auto-fill, minmax(120px, 1fr))", md: "repeat(auto-fill, minmax(160px, 1fr))" }, gap: 2 }}>
          {filtered.map((t) => {
            const css = toCssColor(t.value as ColorValue);
            return (
              <Paper key={t.name} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box
                  sx={{
                    height: 64,
                    bgcolor: css ?? "transparent",
                    backgroundImage: css
                      ? undefined
                      : "repeating-linear-gradient(45deg, #eee 0 6px, #fafafa 6px 12px)",
                  }}
                  aria-label={css ? undefined : "invalid color"}
                />
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                    {t.name.split("/").pop()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={css ? "text.secondary" : "error.main"}
                    sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {css ?? "値が不正"}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {tokenType === "typography" && filtered.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          {filtered.map((t) => {
            const val = t.value as {
              fontSize?: number;
              fontWeight?: string;
              fontFamily?: string;
              lineHeight?: unknown;
              letterSpacing?: unknown;
            };
            const fontSize = typeof val.fontSize === "number" ? val.fontSize : undefined;
            const lh = extractLineHeight(val.lineHeight, fontSize);
            const ls = extractLetterSpacing(val.letterSpacing);
            const weight =
              val.fontWeight === "Bold" ? 700
              : val.fontWeight === "Semi Bold" || val.fontWeight === "SemiBold" ? 600
              : val.fontWeight === "Medium" ? 500
              : 400;
            return (
              <Box
                key={t.name}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 2,
                  "&:first-of-type": { borderTop: 0 },
                }}
              >
                <Box sx={{ minWidth: 200, flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontSize: "0.6875rem", display: "block" }}>
                    {t.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.625rem" }}
                  >
                    {fontSize ?? "?"}px / w{weight} / lh {lh.display}
                    {ls ? ` / ls ${ls.display}` : ""}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: weight,
                    fontSize: fontSize,
                    fontFamily: val.fontFamily || "Inter",
                    lineHeight: lh.ratio,
                    letterSpacing: ls?.css,
                  }}
                >
                  The quick brown fox
                </Typography>
              </Box>
            );
          })}
        </Paper>
      )}

      {tokenType === "spacing" && filtered.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "160px 80px 1fr", px: 2, py: 1, bgcolor: "action.hover", gap: 1 }}>
            <Typography variant="caption" fontWeight={700}>トークン</Typography>
            <Typography variant="caption" fontWeight={700}>値</Typography>
            <Typography variant="caption" fontWeight={700}>プレビュー</Typography>
          </Box>
          {filtered.map((t) => {
            const raw = typeof t.value === "number" ? t.value : NaN;
            const valid = Number.isFinite(raw) && raw >= 0;
            const width = valid ? Math.min(raw, SPACING_PREVIEW_MAX_PX) : 0;
            return (
              <Box key={t.name} sx={{ display: "grid", gridTemplateColumns: "160px 80px 1fr", px: 2, py: 1, borderTop: 1, borderColor: "divider", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                  {t.name.split("/").pop()}
                </Typography>
                <Typography
                  variant="body2"
                  color={valid ? "text.secondary" : "error.main"}
                  sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {valid ? `${raw}px` : "不正"}
                </Typography>
                <Box sx={{ height: 8, width, bgcolor: "primary.main", borderRadius: 0.5 }} />
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
}
