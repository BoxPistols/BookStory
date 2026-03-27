"use client";

import { useEffect, useMemo, useCallback } from "react";

// OS 判定
function getOS(): "mac" | "win" | "other" {
  if (typeof window === "undefined") return "other";
  const ua = window.navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "win";
  return "other";
}

// 修飾キー名（表示用）
export function getModifierLabel(): string {
  const os = getOS();
  if (os === "mac") return "⌥";
  return "Alt";
}

// ショートカット説明（UI表示用）
export function getShortcutHints(): { prev: string; next: string } {
  const mod = getModifierLabel();
  return {
    prev: `${mod} + ←`,
    next: `${mod} + →`,
  };
}

// 修飾キー判定（Mac: Option, Win: Alt — どちらも e.altKey）
function isModifierPressed(e: KeyboardEvent): boolean {
  return e.altKey;
}

interface UseKeyboardNavOptions {
  items: { id: string }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function useKeyboardNav({ items, selectedId, onSelect }: UseKeyboardNavOptions) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const navigate = useCallback(
    (direction: -1 | 1) => {
      if (ids.length === 0) return;
      const currentIndex = selectedId ? ids.indexOf(selectedId) : -1;
      let nextIndex: number;
      if (currentIndex < 0) {
        nextIndex = direction === 1 ? 0 : ids.length - 1;
      } else {
        nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = ids.length - 1;
        if (nextIndex >= ids.length) nextIndex = 0;
      }
      onSelect(ids[nextIndex]);
    },
    [ids, selectedId, onSelect]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // IME 入力中は無視
      if (e.isComposing) return;
      if (!isModifierPressed(e)) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        navigate(1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
}
