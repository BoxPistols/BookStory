"use client";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

interface ComponentRendererProps {
  componentId: string;
  values: Record<string, unknown>;
}

export function ComponentRenderer({ componentId, values }: ComponentRendererProps) {
  switch (componentId) {
    case "button":
      return (
        <Button
          variant={values.variant as "contained" | "outlined" | "text"}
          color={values.color as "primary" | "secondary" | "error" | "warning" | "info" | "success"}
          size={values.size as "small" | "medium" | "large"}
          disabled={values.disabled as boolean}
        >
          {(values.label as string) || "ボタン"}
        </Button>
      );

    case "textfield": {
      // sdpf-theme の CustomTextField パターン: ラベル上配置
      const label = values.label as string;
      const isRequired = values.required as boolean;
      const isError = values.error as boolean;
      const helperText = values.helperText as string;
      return (
        <FormControl
          fullWidth
          disabled={values.disabled as boolean}
          error={isError}
          sx={{ maxWidth: 360 }}
        >
          {label && (
            <InputLabel
              shrink
              sx={{
                position: "static",
                transform: "none",
                mb: 0.5,
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "text.primary",
                "&.Mui-focused": { color: "text.primary" },
                "&.Mui-error": { color: "error.main" },
              }}
            >
              {label}
              {isRequired && (
                <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
                  *
                </Box>
              )}
            </InputLabel>
          )}
          <TextField
            variant={values.variant as "outlined" | "filled" | "standard"}
            size={values.size as "small" | "medium"}
            disabled={values.disabled as boolean}
            error={isError}
            placeholder={values.placeholder as string || ""}
          />
          {helperText && (
            <FormHelperText>{helperText}</FormHelperText>
          )}
        </FormControl>
      );
    }

    case "card":
      return (
        <Card elevation={values.elevation as number} sx={{ maxWidth: 345 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {values.title as string}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {values.content as string}
            </Typography>
          </CardContent>
        </Card>
      );

    case "chip":
      return (
        <Chip
          label={values.label as string}
          variant={values.variant as "filled" | "outlined"}
          color={values.color as "primary" | "secondary" | "error" | "warning" | "info" | "success"}
          size={values.size as "small" | "medium"}
        />
      );

    case "alert":
      return (
        <Alert
          severity={values.severity as "error" | "warning" | "info" | "success"}
          variant={values.variant as "standard" | "filled" | "outlined"}
          sx={{ minWidth: 300 }}
        >
          {values.message as string}
        </Alert>
      );

    default:
      return (
        <Box>
          <Typography color="text.secondary">
            コンポーネントを選択してください
          </Typography>
        </Box>
      );
  }
}
