"use client";

import { createTheme } from "@mui/material/styles";

// sdpf-theme のトークン体系に準拠
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
  spacing: 4,
  shape: { borderRadius: 8 },
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
  palette: {
    mode: "light",
    primary: { main: "#2642be", light: "#5c6fd6", dark: "#1a2c80" },
    secondary: { main: "#696881" },
    success: { main: "#46ab4a" },
    warning: { main: "#eb8117" },
    error: { main: "#da3737" },
    info: { main: "#1dafc2" },
    background: { default: "#faf8fc", paper: "#ffffff" },
    text: { primary: "#2d1f4e", secondary: "#5c4d7a" },
    divider: "#e8e0f0",
  },
} as any);

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: "dark",
    primary: { main: "#5c6fd6", light: "#8b9be8", dark: "#2642be" },
    secondary: { main: "#8b8aaa" },
    success: { main: "#5bc45f" },
    warning: { main: "#f5a623" },
    error: { main: "#f87171" },
    info: { main: "#38d1e5" },
    background: { default: "#0f0d1a", paper: "#1a1726" },
    text: { primary: "#e8e0f0", secondary: "#9b8fbf" },
    divider: "#2d2640",
  },
} as any);
