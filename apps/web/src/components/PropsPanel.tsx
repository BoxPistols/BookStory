"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { alpha, useTheme } from "@mui/material/styles";
import type { PropDefinition } from "@bookstory/core";

export type { PropDefinition };

interface PropsPanelProps {
  props: PropDefinition[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onReset?: () => void;
}

export function PropsPanel({ props, values, onChange, onReset }: PropsPanelProps) {
  const theme = useTheme();

  if (props.length === 0) return null;

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 260 },
        borderLeft: { xs: 0, md: 1 },
        borderTop: { xs: 1, md: 0 },
        borderColor: "divider",
        bgcolor: "background.paper",
        height: { xs: "auto", md: "100%" },
        maxHeight: { xs: 300, md: "100%" },
        overflow: "auto",
        flexShrink: 0,
      }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "text.secondary",
          }}
        >
          Props
        </Typography>
        {onReset && (
          <Tooltip title="初期値にリセット" arrow>
            <IconButton
              size="small"
              onClick={onReset}
              sx={{ color: "text.secondary", width: 24, height: 24 }}
            >
              <RestartAltIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {props.map((prop) => {
          const value = values[prop.name] ?? prop.defaultValue;

          return (
            <Box key={prop.name}>
              {prop.type !== "boolean" && (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    display: "block",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.6875rem",
                  }}
                >
                  {prop.name}
                </Typography>
              )}

              {prop.type === "string" && (
                <TextField
                  size="small"
                  fullWidth
                  value={value as string}
                  onChange={(e) => onChange(prop.name, e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      fontSize: "0.8125rem",
                    },
                  }}
                />
              )}

              {prop.type === "boolean" && (
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={value as boolean}
                      onChange={(e) => onChange(prop.name, e.target.checked)}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "text.secondary",
                      }}
                    >
                      {prop.name}
                    </Typography>
                  }
                />
              )}

              {prop.type === "select" && (
                <Select
                  size="small"
                  fullWidth
                  value={value as string}
                  onChange={(e) => onChange(prop.name, e.target.value)}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.8125rem",
                    "& .MuiSelect-select": { py: 0.75 },
                  }}
                >
                  {prop.options?.map((opt) => (
                    <MenuItem key={opt} value={opt} sx={{ fontSize: "0.8125rem" }}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              )}

              {prop.type === "number" && (
                <Box sx={{ px: 0.5 }}>
                  <Slider
                    size="small"
                    value={value as number}
                    min={prop.min ?? 0}
                    max={prop.max ?? 100}
                    onChange={(_, v) => onChange(prop.name, v)}
                    valueLabelDisplay="auto"
                    sx={{
                      "& .MuiSlider-thumb": { width: 14, height: 14 },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "text.secondary",
                      fontSize: "0.625rem",
                    }}
                  >
                    {value as number}
                  </Typography>
                </Box>
              )}

              {prop.type === "color" && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1.5,
                    p: 0.5,
                  }}
                >
                  <Box
                    component="input"
                    type="color"
                    value={value as string}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(prop.name, e.target.value)
                    }
                    sx={{
                      width: 28,
                      height: 28,
                      border: "none",
                      borderRadius: 1,
                      cursor: "pointer",
                      p: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "text.secondary",
                    }}
                  >
                    {value as string}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
