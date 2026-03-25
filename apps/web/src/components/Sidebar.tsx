"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { alpha } from "@mui/material/styles";

export interface SidebarItem {
  id: string;
  label: string;
  category: string;
}

interface SidebarProps {
  items: SidebarItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Monokai テーマベースのダーク固定
const sidebarColors = {
  bg: "#272822",
  surface: "#3E3D32",
  border: "#49483E",
  text: "#F8F8F2",
  textSecondary: "#A6A69C",
  textMuted: "#75715E",
  selected: "rgba(166, 226, 46, 0.12)",
  selectedText: "#A6E22E",
  hover: "rgba(248, 248, 242, 0.05)",
};

export function Sidebar({ items, selectedId, onSelect }: SidebarProps) {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );
  const categories = [...new Set(filtered.map((item) => item.category))];

  return (
    <Box
      sx={{
        width: 220,
        height: "100vh",
        borderRight: 1,
        borderColor: sidebarColors.border,
        display: "flex",
        flexDirection: "column",
        bgcolor: sidebarColors.bg,
        flexShrink: 0,
        color: sidebarColors.text,
      }}
    >
      {/* ロゴ */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Box
            component="svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            sx={{ width: 24, height: 24, flexShrink: 0 }}
          >
            <rect width="32" height="32" rx="7" fill="#FF4785"/>
            <path d="M7 9.5C7 8.67 7.67 8 8.5 8H16v16H8.5C7.67 24 7 23.33 7 22.5V9.5z" fill="rgba(255,255,255,0.65)"/>
            <path d="M16 8h7.5c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5H16V8z" fill="rgba(255,255,255,0.92)"/>
            <rect x="15.5" y="8" width="1" height="16" fill="rgba(255,255,255,0.35)"/>
            <circle cx="21" cy="12.5" r="2.5" fill="#FF4785" opacity="0.6"/>
            <rect x="18.5" y="17" width="5" height="3.5" rx="0.75" fill="#FF4785" opacity="0.4"/>
            <text x="11.5" y="17.5" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="7" fill="#FF4785" opacity="0.55">&lt;/&gt;</text>
          </Box>
          <Typography variant="h6" sx={{ color: sidebarColors.text }}>
            BookStory
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: sidebarColors.border,
            bgcolor: sidebarColors.surface,
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: sidebarColors.textMuted }} />
          <InputBase
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              fontSize: "0.8125rem",
              flex: 1,
              color: sidebarColors.text,
              "& input": { p: 0 },
              "& input::placeholder": { color: sidebarColors.textMuted, opacity: 1 },
            }}
          />
        </Box>
      </Box>

      {/* ナビ */}
      <Box sx={{ flex: 1, overflow: "auto", px: 1.5, pt: 1 }}>
        <List disablePadding>
          {categories.map((cat) => {
            const isOpen = openCategories[cat] !== false;
            const catItems = filtered.filter((item) => item.category === cat);
            return (
              <Box key={cat} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() =>
                    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
                  }
                  sx={{
                    py: 0.75,
                    px: 1,
                    borderRadius: 1,
                    minHeight: 32,
                    "&:hover": { bgcolor: sidebarColors.hover },
                  }}
                >
                  <ListItemText
                    primary={cat}
                    primaryTypographyProps={{
                      variant: "caption",
                      fontWeight: 700,
                      color: sidebarColors.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  />
                  {isOpen ? (
                    <ExpandLess sx={{ fontSize: 14, color: sidebarColors.textMuted }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 14, color: sidebarColors.textMuted }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpen}>
                  <List disablePadding>
                    {catItems.map((item) => {
                      const isSelected = selectedId === item.id;
                      return (
                        <ListItemButton
                          key={item.id}
                          selected={isSelected}
                          onClick={() => onSelect(item.id)}
                          sx={{
                            py: 0.625,
                            px: 1,
                            pl: 3,
                            borderRadius: 1,
                            minHeight: 32,
                            "&:hover": { bgcolor: sidebarColors.hover },
                            "&.Mui-selected": {
                              bgcolor: sidebarColors.selected,
                              "&:hover": { bgcolor: sidebarColors.selected },
                            },
                          }}
                        >
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              variant: "body2",
                              fontWeight: isSelected ? 600 : 400,
                              color: isSelected
                                ? sidebarColors.selectedText
                                : sidebarColors.textSecondary,
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
