"use client";

import { useState, useEffect } from "react";
import type { CatalogComponent, Catalog, DesignToken } from "@bookstory/core";

export type { CatalogComponent, Catalog, DesignToken };

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => {
        if (!r.ok) throw new Error(`カタログ取得失敗: ${r.status}`);
        return r.json();
      })
      .then((data: Catalog) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "カタログの読み込みに失敗しました");
        setLoading(false);
      });
  }, []);

  return { catalog, loading, error };
}
