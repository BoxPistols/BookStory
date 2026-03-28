export interface DesignToken {
  name: string;
  type: "color" | "spacing" | "typography" | "borderRadius" | "shadow" | "effect";
  value: unknown;
  figmaVariable?: string;
  modes?: Record<string, unknown>;
}

export interface PropDefinition {
  name: string;
  type: "string" | "boolean" | "number" | "select" | "color";
  defaultValue: unknown;
  options?: string[];
  min?: number;
  max?: number;
  figmaProperty?: string;
}

export interface CatalogComponent {
  id: string;
  name: string;
  filePath?: string;
  category: string;
  description?: string;
  props: PropDefinition[];
  exportName?: string;
  variants?: Record<string, string[]>;
  nodeTree?: unknown;
  variantTrees?: Record<string, unknown>;
}

export interface Catalog {
  generatedAt: string | null;
  componentDir?: string;
  components: CatalogComponent[];
  tokens: DesignToken[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  figmaNodeId?: string;
  figmaFileKey?: string;
  props: PropDefinition[];
  code?: string;
}

export interface FigmaSync {
  componentId: string;
  figmaNodeId: string;
  figmaFileKey: string;
  lastSyncedAt: string;
  status: "synced" | "outdated" | "missing";
}

export interface TokenValidation {
  token: DesignToken;
  issues: TokenIssue[];
}

export interface TokenIssue {
  type: "missing_dark_mode" | "missing_light_mode" | "invalid_value" | "no_figma_variable";
  message: string;
  severity: "warning" | "error";
}
