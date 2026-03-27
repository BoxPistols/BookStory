"use client";

import { createTheme } from "@mui/material/styles";
import { toMuiPalette, SPACING, SHAPE } from "./design-tokens";

// sdpf-theme のトークン体系に準拠（カラー値は design-tokens.ts で一元管理）
const shared = {
  typography: {
    fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    fontSize: 14,
    h5: { fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em" },
    h6: { fontWeight: 700, fontSize: "1rem" },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body1: { fontSize: "0.875rem", lineHeight: 1.65 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.6 },
    caption: { fontSize: "0.6875rem" },
  },
  spacing: SPACING.base,
  shape: { borderRadius: SHAPE.borderRadius },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" as const, fontWeight: 600, boxShadow: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none" as const, fontWeight: 500, fontSize: "0.8125rem", minHeight: 36, padding: "6px 0" },
      },
    },
    MuiTabs: {
      styleOverrides: { root: { minHeight: 36 }, indicator: { height: 2 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
};

export const lightTheme = createTheme({
  ...shared,
  palette: toMuiPalette("light"),
} as Parameters<typeof createTheme>[0]);

export const darkTheme = createTheme({
  ...shared,
  palette: toMuiPalette("dark"),
} as Parameters<typeof createTheme>[0]);
