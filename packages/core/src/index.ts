export interface DesignToken {
  name: string;
  type: "color" | "spacing" | "typography" | "borderRadius" | "shadow";
  value: string | number;
  figmaVariable?: string;
  modes?: Record<string, string | number>;
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

export interface PropDefinition {
  name: string;
  type: "string" | "boolean" | "number" | "select" | "color";
  defaultValue: unknown;
  options?: string[];
  min?: number;
  max?: number;
  figmaProperty?: string;
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
