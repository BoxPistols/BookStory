"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import type { InspectedElement } from "./InspectOverlay";

interface InspectPanelProps {
  element: InspectedElement;
}

function parsePixel(v: string): number {
  return Math.round(parseFloat(v) || 0);
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  const hex = [r, g, b]
    .map((v) => parseInt(v).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}`;
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.375 }}>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.6875rem" }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        {color && (
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: color,
              border: 1,
              borderColor: "divider",
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6875rem",
            fontWeight: 500,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function BoxModel({ element }: { element: InspectedElement }) {
  const c = element.computed;
  const m = [c.marginTop, c.marginRight, c.marginBottom, c.marginLeft].map(parsePixel);
  const p = [c.paddingTop, c.paddingRight, c.paddingBottom, c.paddingLeft].map(parsePixel);
  const w = parseInt(c.width);
  const h = parseInt(c.height);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 1,
      }}
    >
      {/* Margin */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "rgba(245, 158, 11, 0.08)",
          border: "1px dashed rgba(245, 158, 11, 0.3)",
          borderRadius: 1,
          px: 2,
          py: 1,
          position: "relative",
        }}
      >
        <Label value={m[0]} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
          <Label value={m[3]} />
          {/* Padding */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: 0.75,
              px: 1.5,
              py: 0.75,
              mx: 0.5,
            }}
          >
            <Label value={p[0]} />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Label value={p[3]} />
              {/* Content */}
              <Box
                sx={{
                  bgcolor: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: 0.5,
                  px: 1.5,
                  py: 0.5,
                  mx: 0.5,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {w} x {h}
                </Typography>
              </Box>
              <Label value={p[1]} />
            </Box>
            <Label value={p[2]} />
          </Box>
          <Label value={m[1]} />
        </Box>
        <Label value={m[2]} />
      </Box>
    </Box>
  );
}

function Label({ value }: { value: number }) {
  if (value === 0) return <Box sx={{ width: 16, textAlign: "center" }}><Typography variant="caption" sx={{ fontSize: 9, color: "text.secondary", opacity: 0.4 }}>-</Typography></Box>;
  return (
    <Box sx={{ minWidth: 16, textAlign: "center", px: 0.25 }}>
      <Typography
        variant="caption"
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.5625rem",
          fontWeight: 600,
          color: "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function InspectPanel({ element }: InspectPanelProps) {
  const c = element.computed;

  return (
    <Box
      sx={{
        width: 260,
        borderLeft: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        height: "100%",
        overflow: "auto",
        flexShrink: 0,
      }}
    >
      {/* ヘッダー */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
          }}
        >
          Inspect
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            mt: 0.5,
            color: "primary.main",
          }}
        >
          &lt;{element.tagName}&gt;
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* サイズ */}
        <Section label="サイズ">
          <Row label="Width" value={`${c.width}px`} />
          <Row label="Height" value={`${c.height}px`} />
        </Section>

        {/* ボックスモデル */}
        <Section label="ボックスモデル">
          <BoxModel element={element} />
        </Section>

        {/* タイポグラフィ */}
        <Section label="タイポグラフィ">
          <Row label="Font Size" value={c.fontSize} />
          <Row label="Font Weight" value={c.fontWeight} />
          <Row label="Line Height" value={c.lineHeight} />
          <Row label="Letter Spacing" value={c.letterSpacing} />
          <Row
            label="Font Family"
            value={c.fontFamily.split(",")[0].replace(/['"]/g, "")}
          />
        </Section>

        {/* カラー */}
        <Section label="カラー">
          <Row label="Color" value={rgbToHex(c.color)} color={c.color} />
          {c.backgroundColor !== "rgba(0, 0, 0, 0)" && (
            <Row
              label="Background"
              value={rgbToHex(c.backgroundColor)}
              color={c.backgroundColor}
            />
          )}
        </Section>

        {/* レイアウト */}
        <Section label="レイアウト">
          <Row label="Display" value={c.display} />
          {c.gap !== "normal" && c.gap !== "0px" && <Row label="Gap" value={c.gap} />}
          {c.borderRadius !== "0px" && <Row label="Border Radius" value={c.borderRadius} />}
        </Section>

        {/* アクセシビリティ */}
        <Section label="アクセシビリティ">
          <Row label="Role" value={c.role} />
          {c.ariaLabel && <Row label="aria-label" value={c.ariaLabel} />}
        </Section>
      </Box>
    </Box>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: "0.625rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "text.secondary",
          mb: 0.5,
          display: "block",
        }}
      >
        {label}
      </Typography>
      {children}
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
}
