"use client";

import { Highlight, themes } from "prism-react-renderer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Highlight theme={themes.dracula} code={code} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
          {/* コピーボタン */}
          <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
            <Tooltip title={copied ? "コピーしました" : "コピー"} arrow>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: "rgba(248,248,242,0.5)",
                  bgcolor: "rgba(248,248,242,0.06)",
                  width: 28,
                  height: 28,
                  "&:hover": { bgcolor: "rgba(248,248,242,0.12)", color: "rgba(248,248,242,0.8)" },
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            component="pre"
            sx={{
              ...style,
              m: 0,
              p: 2.5,
              pr: 5,
              fontSize: "0.8125rem",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineHeight: 1.7,
              overflow: "auto",
              borderRadius: 2,
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {/* 行番号 */}
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 28,
                    mr: 2,
                    textAlign: "right",
                    color: "rgba(248,248,242,0.2)",
                    userSelect: "none",
                    fontSize: "0.75rem",
                  }}
                >
                  {i + 1}
                </Box>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </Box>
        </Box>
      )}
    </Highlight>
  );
}
