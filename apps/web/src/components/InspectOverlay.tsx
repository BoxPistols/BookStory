"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";

export interface InspectedElement {
  tagName: string;
  className: string;
  rect: DOMRect;
  computed: {
    width: string;
    height: string;
    paddingTop: string;
    paddingRight: string;
    paddingBottom: string;
    paddingLeft: string;
    marginTop: string;
    marginRight: string;
    marginBottom: string;
    marginLeft: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    color: string;
    backgroundColor: string;
    borderRadius: string;
    display: string;
    gap: string;
    // アクセシビリティ
    role: string;
    ariaLabel: string;
  };
}

interface InspectOverlayProps {
  containerRef: React.RefObject<HTMLElement | null>;
  active: boolean;
  onInspect: (element: InspectedElement | null) => void;
}

function parsePixel(v: string): number {
  return Math.round(parseFloat(v) || 0);
}

export function InspectOverlay({ containerRef, active, onInspect }: InspectOverlayProps) {
  const [hover, setHover] = useState<{
    rect: DOMRect;
    padding: [number, number, number, number];
    margin: [number, number, number, number];
    label: string;
    size: string;
  } | null>(null);

  const [pinned, setPinned] = useState<DOMRect | null>(null);

  const extract = useCallback((el: HTMLElement): InspectedElement => {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tagName: el.tagName.toLowerCase(),
      className: el.className?.toString().slice(0, 80) || "",
      rect,
      computed: {
        width: `${Math.round(rect.width)}`,
        height: `${Math.round(rect.height)}`,
        paddingTop: cs.paddingTop,
        paddingRight: cs.paddingRight,
        paddingBottom: cs.paddingBottom,
        paddingLeft: cs.paddingLeft,
        marginTop: cs.marginTop,
        marginRight: cs.marginRight,
        marginBottom: cs.marginBottom,
        marginLeft: cs.marginLeft,
        fontSize: cs.fontSize,
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        borderRadius: cs.borderRadius,
        display: cs.display,
        gap: cs.gap,
        role: el.getAttribute("role") || el.tagName.toLowerCase(),
        ariaLabel: el.getAttribute("aria-label") || "",
      },
    };
  }, []);

  useEffect(() => {
    if (!active || !containerRef.current) {
      setHover(null);
      setPinned(null);
      return;
    }

    const container = containerRef.current;

    const handleMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!container.contains(target) || target === container) return;

      const rect = target.getBoundingClientRect();
      const cs = getComputedStyle(target);
      const containerRect = container.getBoundingClientRect();

      setHover({
        rect: new DOMRect(
          rect.x - containerRect.x,
          rect.y - containerRect.y,
          rect.width,
          rect.height
        ),
        padding: [
          parsePixel(cs.paddingTop),
          parsePixel(cs.paddingRight),
          parsePixel(cs.paddingBottom),
          parsePixel(cs.paddingLeft),
        ],
        margin: [
          parsePixel(cs.marginTop),
          parsePixel(cs.marginRight),
          parsePixel(cs.marginBottom),
          parsePixel(cs.marginLeft),
        ],
        label: target.tagName.toLowerCase(),
        size: `${Math.round(rect.width)} x ${Math.round(rect.height)}`,
      });
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (!container.contains(target) || target === container) return;

      const info = extract(target);
      onInspect(info);
      const containerRect = container.getBoundingClientRect();
      setPinned(
        new DOMRect(
          info.rect.x - containerRect.x,
          info.rect.y - containerRect.y,
          info.rect.width,
          info.rect.height
        )
      );
    };

    const handleLeave = () => setHover(null);

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("click", handleClick, true);
    container.addEventListener("mouseleave", handleLeave);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("click", handleClick, true);
      container.removeEventListener("mouseleave", handleLeave);
    };
  }, [active, containerRef, extract, onInspect]);

  if (!active) return null;

  return (
    <>
      {/* ホバーオーバーレイ */}
      {hover && (
        <>
          {/* マージン（オレンジ） */}
          {hover.margin.some((m) => m > 0) && (
            <Box
              sx={{
                position: "absolute",
                top: hover.rect.y - hover.margin[0],
                left: hover.rect.x - hover.margin[3],
                width: hover.rect.width + hover.margin[1] + hover.margin[3],
                height: hover.rect.height + hover.margin[0] + hover.margin[2],
                bgcolor: alpha("#F59E0B", 0.12),
                border: `1px dashed ${alpha("#F59E0B", 0.4)}`,
                pointerEvents: "none",
                zIndex: 10,
                borderRadius: 0.5,
              }}
            />
          )}

          {/* パディング（グリーン） */}
          <Box
            sx={{
              position: "absolute",
              top: hover.rect.y,
              left: hover.rect.x,
              width: hover.rect.width,
              height: hover.rect.height,
              bgcolor: alpha("#10B981", 0.1),
              border: `1px solid ${alpha("#3B82F6", 0.6)}`,
              pointerEvents: "none",
              zIndex: 11,
              borderRadius: 0.5,
            }}
          />

          {/* コンテンツ領域（青） */}
          {hover.padding.some((p) => p > 0) && (
            <Box
              sx={{
                position: "absolute",
                top: hover.rect.y + hover.padding[0],
                left: hover.rect.x + hover.padding[3],
                width: hover.rect.width - hover.padding[1] - hover.padding[3],
                height: hover.rect.height - hover.padding[0] - hover.padding[2],
                bgcolor: alpha("#3B82F6", 0.08),
                pointerEvents: "none",
                zIndex: 12,
                borderRadius: 0.25,
              }}
            />
          )}

          {/* サイズラベル */}
          <Box
            sx={{
              position: "absolute",
              top: hover.rect.y - 22,
              left: hover.rect.x,
              bgcolor: "#3B82F6",
              color: "#fff",
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              pointerEvents: "none",
              zIndex: 13,
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            {hover.label} {hover.size}
          </Box>

          {/* パディング数値（上下左右） */}
          {hover.padding[0] > 0 && (
            <SizeLabel
              top={hover.rect.y + 2}
              left={hover.rect.x + hover.rect.width / 2 - 8}
              value={hover.padding[0]}
              color="#10B981"
            />
          )}
          {hover.padding[2] > 0 && (
            <SizeLabel
              top={hover.rect.y + hover.rect.height - 14}
              left={hover.rect.x + hover.rect.width / 2 - 8}
              value={hover.padding[2]}
              color="#10B981"
            />
          )}
          {hover.padding[3] > 0 && (
            <SizeLabel
              top={hover.rect.y + hover.rect.height / 2 - 6}
              left={hover.rect.x + 2}
              value={hover.padding[3]}
              color="#10B981"
            />
          )}
          {hover.padding[1] > 0 && (
            <SizeLabel
              top={hover.rect.y + hover.rect.height / 2 - 6}
              left={hover.rect.x + hover.rect.width - 20}
              value={hover.padding[1]}
              color="#10B981"
            />
          )}
        </>
      )}

      {/* ピン留めされた要素 */}
      {pinned && (
        <Box
          sx={{
            position: "absolute",
            top: pinned.y,
            left: pinned.x,
            width: pinned.width,
            height: pinned.height,
            border: `2px solid #3B82F6`,
            pointerEvents: "none",
            zIndex: 14,
            borderRadius: 0.5,
          }}
        />
      )}
    </>
  );
}

function SizeLabel({
  top,
  left,
  value,
  color,
}: {
  top: number;
  left: number;
  value: number;
  color: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left,
        bgcolor: color,
        color: "#fff",
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        px: 0.5,
        borderRadius: 0.25,
        pointerEvents: "none",
        zIndex: 15,
        lineHeight: 1.4,
      }}
    >
      {value}
    </Box>
  );
}
