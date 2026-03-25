"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "@/lib/ThemeContext";

export function Header() {
  const { mode, toggle } = useThemeMode();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#272822",
        borderBottom: 1,
        borderColor: "#49483E",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 44, px: 3 }}>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" onClick={toggle} sx={{ color: "#A6A69C" }}>
          {mode === "light" ? (
            <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
          ) : (
            <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
