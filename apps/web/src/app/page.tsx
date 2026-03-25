"use client";

import { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Preview } from "@/components/Preview";
import { PropsPanel } from "@/components/PropsPanel";
import { ComponentRenderer } from "@/components/ComponentRenderer";
import { TokenViewer } from "@/components/TokenViewer";
import {
  sidebarItems,
  componentProps,
  componentDescriptions,
  generateCode,
} from "@/lib/demo-data";

const tokenViews = ["colors", "typography", "spacing"] as const;

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>("button");
  const [propValues, setPropValues] = useState<Record<string, Record<string, unknown>>>({});
  const [inspectActive, setInspectActive] = useState(false);

  const handlePropChange = useCallback(
    (name: string, value: unknown) => {
      if (!selectedId) return;
      setPropValues((prev) => ({
        ...prev,
        [selectedId]: { ...prev[selectedId], [name]: value },
      }));
    },
    [selectedId]
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setInspectActive(false);
  };

  const handleReset = useCallback(() => {
    if (!selectedId) return;
    setPropValues((prev) => {
      const next = { ...prev };
      delete next[selectedId];
      return next;
    });
  }, [selectedId]);

  const currentProps = selectedId ? componentProps[selectedId] || [] : [];
  const currentValues = selectedId ? propValues[selectedId] || {} : {};

  const mergedValues: Record<string, unknown> = {};
  for (const prop of currentProps) {
    mergedValues[prop.name] = currentValues[prop.name] ?? prop.defaultValue;
  }

  const isTokenView =
    selectedId && tokenViews.includes(selectedId as (typeof tokenViews)[number]);
  const isComponentView = selectedId && !isTokenView;
  const description = selectedId ? componentDescriptions[selectedId] : undefined;

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        items={sidebarItems}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header />

        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {isTokenView && (
            <TokenViewer
              viewType={selectedId as "colors" | "typography" | "spacing"}
              alerts={[
                {
                  type: "warning",
                  message:
                    "Figmaバリアブルコレクション: ダークモードのトークンが一部未定義です。",
                },
              ]}
            />
          )}

          {isComponentView && (
            <>
              <Preview
                title={sidebarItems.find((i) => i.id === selectedId)?.label || ""}
                code={generateCode(selectedId, mergedValues)}
                figmaStatus="synced"
                description={description}
                onInspectChange={setInspectActive}
              >
                <ComponentRenderer
                  componentId={selectedId}
                  values={mergedValues}
                />
              </Preview>

              {!inspectActive && (
                <PropsPanel
                  props={currentProps}
                  values={mergedValues}
                  onChange={handlePropChange}
                  onReset={handleReset}
                />
              )}
            </>
          )}

          {!selectedId && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              サイドバーからコンポーネントを選択してください
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
