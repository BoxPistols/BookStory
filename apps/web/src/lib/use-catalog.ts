"use client";

import { useState, useEffect } from "react";

export interface CatalogComponent {
  id: string;
  name: string;
  filePath: string;
  category: string;
  props: { name: string; type: string; required: boolean; defaultValue?: string }[];
  exportName: string;
}

export interface Catalog {
  generatedAt: string | null;
  componentDir: string;
  components: CatalogComponent[];
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data: Catalog) => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { catalog, loading };
}
