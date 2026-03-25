"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

interface TokenViewerProps {
  viewType: "colors" | "typography" | "spacing";
  alerts?: { type: "warning" | "error"; message: string }[];
}

// --- Color ---
function ColorTokens() {
  const theme = useTheme();

  const groups = [
    {
      label: "Brand",
      tokens: [
        { name: "Primary", value: theme.palette.primary.main, token: "primary.main" },
        { name: "Primary Light", value: theme.palette.primary.light, token: "primary.light" },
        { name: "Primary Dark", value: theme.palette.primary.dark, token: "primary.dark" },
        { name: "Secondary", value: theme.palette.secondary.main, token: "secondary.main" },
      ],
    },
    {
      label: "Semantic",
      tokens: [
        { name: "Success", value: theme.palette.success.main, token: "success.main" },
        { name: "Warning", value: theme.palette.warning.main, token: "warning.main" },
        { name: "Error", value: theme.palette.error.main, token: "error.main" },
        { name: "Info", value: theme.palette.info.main, token: "info.main" },
      ],
    },
    {
      label: "Surface",
      tokens: [
        { name: "Background", value: theme.palette.background.default, token: "background.default" },
        { name: "Paper", value: theme.palette.background.paper, token: "background.paper" },
        { name: "Text", value: theme.palette.text.primary, token: "text.primary" },
        { name: "Text Secondary", value: theme.palette.text.secondary, token: "text.secondary" },
      ],
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {groups.map((group) => (
        <Box key={group.label}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "text.secondary",
              mb: 2,
              display: "block",
            }}
          >
            {group.label}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
            {group.tokens.map((c) => (
              <Paper key={c.token} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ height: 64, bgcolor: c.value }} />
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {c.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", display: "block" }}
                  >
                    {c.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}
                  >
                    {c.token}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// --- Typography（sdpf-theme の TypeRow パターン準拠）---
function TypographyTokens() {
  const sections = [
    {
      label: "HEADINGS",
      title: "見出し (Headings)",
      rows: [
        { label: "Display Large", size: "32px", weight: 700, lineHeight: 1.4, usage: "ヒーローセクション" },
        { label: "Display Medium", size: "28px", weight: 700, lineHeight: 1.4, usage: "ページヒーロー" },
        { label: "Display Small", size: "24px", weight: 700, lineHeight: 1.4, usage: "セクションヒーロー" },
        { label: "H1", size: "22px", weight: 700, lineHeight: 1.4, usage: "ページタイトル" },
        { label: "H2", size: "20px", weight: 700, lineHeight: 1.4, usage: "セクション見出し" },
        { label: "H3", size: "18px", weight: 700, lineHeight: 1.4, usage: "サブセクション" },
        { label: "H4", size: "16px", weight: 700, lineHeight: 1.4, usage: "カード見出し" },
        { label: "H5", size: "14px", weight: 700, lineHeight: 1.4, usage: "リスト見出し" },
        { label: "H6", size: "12px", weight: 700, lineHeight: 1.4, usage: "最小見出し" },
      ],
    },
    {
      label: "BODY & UTILITY",
      title: "本文・ユーティリティ (Body & Utility)",
      rows: [
        { label: "Body 1", size: "14px", weight: 400, lineHeight: 1.6, usage: "本文（標準）" },
        { label: "Body 2", size: "12px", weight: 400, lineHeight: 1.6, usage: "本文（小）" },
        { label: "Caption", size: "12px", weight: 400, lineHeight: 1.4, usage: "注釈・補足" },
        { label: "Overline", size: "12px", weight: 400, lineHeight: 1.4, usage: "ラベル" },
        { label: "Button", size: "14px", weight: 400, lineHeight: 1.6, usage: "ボタンラベル" },
      ],
    },
    {
      label: "CUSTOM SIZES",
      title: "カスタムサイズバリアント",
      desc: "プロジェクト固有のサイズバリアント。コンポーネント内のテキストサイズ指定に使用",
      rows: [
        { label: "XXL", size: "22px", weight: 700, lineHeight: 1.4, usage: "特大表示" },
        { label: "XL", size: "20px", weight: 700, lineHeight: 1.4, usage: "大表示" },
        { label: "LG", size: "18px", weight: 700, lineHeight: 1.4, usage: "中大表示" },
        { label: "ML", size: "16px", weight: 400, lineHeight: 1.4, usage: "中表示" },
        { label: "MD", size: "14px", weight: 400, lineHeight: 1.4, usage: "標準（基準）" },
        { label: "SM", size: "12px", weight: 400, lineHeight: 1.4, usage: "小（最小本文）" },
        { label: "XS", size: "10px", weight: 400, lineHeight: 1.4, usage: "最小（特殊用途）" },
      ],
    },
  ];

  const sampleText = "サンプルテキスト Sample Text 123";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {/* メタ情報 */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          基準フォントサイズ: 14px | フォントファミリー: Inter, Noto Sans JP
        </Typography>
        <Typography variant="caption" color="text.secondary">
          1rem = 14px 換算。最小本文サイズ12px原則に準拠
        </Typography>
      </Box>

      {sections.map((section) => (
        <Box key={section.label}>
          {/* セクションラベル */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "text.secondary",
              mb: 1,
              display: "block",
            }}
          >
            {section.label}
          </Typography>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {section.title}
          </Typography>
          {section.desc && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: "block" }}>
              {section.desc}
            </Typography>
          )}

          {/* TypeRow テーブル */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
            {section.rows.map((row, i) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 3,
                  px: 3,
                  py: 2,
                  borderBottom: i < section.rows.length - 1 ? 1 : 0,
                  borderColor: "divider",
                  flexWrap: "wrap",
                }}
              >
                {/* 左: バリアント名 + メタ */}
                <Box sx={{ minWidth: 160, flexShrink: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {row.label}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 0.25 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {row.size}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      w{row.weight}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      lh{row.lineHeight}
                    </Typography>
                  </Box>
                </Box>

                {/* 中央: サンプルテキスト */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: row.size,
                      fontWeight: row.weight,
                      lineHeight: row.lineHeight,
                    }}
                  >
                    {sampleText}
                  </Typography>
                </Box>

                {/* 右: 用途 */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100, textAlign: "right", flexShrink: 0 }}
                >
                  {row.usage}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      ))}
    </Box>
  );
}

// --- Spacing ---
function SpacingTokens() {
  const spacings = [
    { mult: 1, usage: "最小単位" },
    { mult: 2, usage: "インライン要素" },
    { mult: 3, usage: "密なレイアウト" },
    { mult: 4, usage: "標準" },
    { mult: 6, usage: "カードパディング" },
    { mult: 8, usage: "セクション間" },
    { mult: 12, usage: "ページセクション" },
    { mult: 16, usage: "大きなセクション" },
    { mult: 24, usage: "最大ギャップ" },
  ];

  return (
    <Box>
      {/* ヘッダー */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            px: 3,
            py: 1.5,
            borderBottom: 2,
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              minWidth: 100,
            }}
          >
            トークン
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              minWidth: 50,
            }}
          >
            値
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              flex: 1,
            }}
          >
            プレビュー
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "text.secondary",
              minWidth: 100,
              textAlign: "right",
            }}
          >
            用途
          </Typography>
        </Box>

        {spacings.map((s, i) => (
          <Box
            key={s.mult}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              px: 3,
              py: 1.5,
              borderBottom: i < spacings.length - 1 ? 1 : 0,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: "primary.main",
                minWidth: 100,
              }}
            >
              spacing({s.mult})
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "'JetBrains Mono', monospace", minWidth: 50 }}
            >
              {s.mult * 4}px
            </Typography>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  height: 8,
                  width: Math.min(s.mult * 8, 200),
                  minWidth: 4,
                  bgcolor: "primary.main",
                  borderRadius: 0.5,
                  opacity: 0.6,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ minWidth: 100, textAlign: "right" }}
            >
              {s.usage}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export function TokenViewer({ viewType, alerts }: TokenViewerProps) {
  const titles = { colors: "Color", typography: "タイポグラフィスケール", spacing: "Spacing" };

  return (
    <Box sx={{ flex: 1, px: 5, py: 4, overflow: "auto" }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {titles[viewType]}
      </Typography>
      {alerts?.map((a, i) => (
        <Alert key={i} severity={a.type} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          {a.message}
        </Alert>
      ))}
      {!alerts?.length && <Box sx={{ mb: 3 }} />}
      {viewType === "colors" && <ColorTokens />}
      {viewType === "typography" && <TypographyTokens />}
      {viewType === "spacing" && <SpacingTokens />}
    </Box>
  );
}
