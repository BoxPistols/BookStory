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
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        flexShrink: 0,
      }}
    >
      {/* ロゴ */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          BookStory
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
          }}
        >
          <SearchIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <InputBase
            placeholder="検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: "0.8125rem", flex: 1, "& input": { p: 0 } }}
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
                  sx={{ py: 0.75, px: 1, borderRadius: 1, minHeight: 32 }}
                >
                  <ListItemText
                    primary={cat}
                    primaryTypographyProps={{
                      variant: "caption",
                      fontWeight: 700,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  />
                  {isOpen ? (
                    <ExpandLess sx={{ fontSize: 14, color: "text.secondary" }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 14, color: "text.secondary" }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpen}>
                  <List disablePadding>
                    {catItems.map((item) => (
                      <ListItemButton
                        key={item.id}
                        selected={selectedId === item.id}
                        onClick={() => onSelect(item.id)}
                        sx={{
                          py: 0.625,
                          px: 1,
                          pl: 3,
                          borderRadius: 1,
                          minHeight: 32,
                          "&.Mui-selected": {
                            bgcolor: "action.selected",
                          },
                        }}
                      >
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            variant: "body2",
                            fontWeight: selectedId === item.id ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
                    ))}
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
