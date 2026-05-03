// Figma から受け取ったコンポーネント/トークンの整合性チェック
// publish 前の衛生検査。errors は拒否、warnings は通すが UI に表示する。

import type { CatalogComponent, DesignToken } from "@bookstory/core";

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function isVariableAlias(v: unknown): boolean {
  return isObject(v) && v.type === "VARIABLE_ALIAS";
}

function isRgb(v: unknown): boolean {
  if (!isObject(v)) return false;
  return typeof v.r === "number" && typeof v.g === "number" && typeof v.b === "number";
}

function isValidHex(v: unknown): boolean {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(v);
}

export function validateTokens(tokens: DesignToken[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Map<string, number>();

  for (const t of tokens) {
    if (!t || typeof t !== "object") {
      errors.push("tokens に不正なエントリがあります");
      continue;
    }
    if (typeof t.name !== "string" || t.name.trim() === "") {
      errors.push("名前のないトークンがあります");
      continue;
    }
    const count = (seen.get(t.name) ?? 0) + 1;
    seen.set(t.name, count);
    if (count === 2) warnings.push(`重複トークン: ${t.name}`);

    if (isVariableAlias(t.value)) {
      warnings.push(`未解決の Variable Alias: ${t.name}（別変数への参照が解決できませんでした）`);
      continue;
    }

    if (t.type === "color") {
      if (!isRgb(t.value) && !isValidHex(t.value)) {
        warnings.push(`Color トークン ${t.name} の値が不正です`);
      }
    } else if (t.type === "typography") {
      if (!isObject(t.value)) {
        warnings.push(`Typography トークン ${t.name} の値が不正です`);
      } else {
        const v = t.value as Record<string, unknown>;
        if (typeof v.fontSize !== "number") warnings.push(`Typography ${t.name}: fontSize 欠損`);
        if (typeof v.fontFamily !== "string") warnings.push(`Typography ${t.name}: fontFamily 欠損`);
      }
    } else if (t.type === "spacing") {
      if (typeof t.value !== "number" || !Number.isFinite(t.value) || t.value < 0) {
        warnings.push(`Spacing トークン ${t.name} の値が不正です`);
      }
    }
  }

  return { errors, warnings };
}

export function validateComponents(components: CatalogComponent[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Map<string, number>();

  for (const c of components) {
    if (!c || typeof c !== "object") {
      errors.push("components に不正なエントリがあります");
      continue;
    }
    if (typeof c.name !== "string" || c.name.trim() === "") {
      errors.push("名前のないコンポーネントがあります");
      continue;
    }
    if (typeof c.id !== "string" || c.id.trim() === "") {
      errors.push(`id のないコンポーネントがあります: ${c.name}`);
      continue;
    }
    const count = (seen.get(c.name) ?? 0) + 1;
    seen.set(c.name, count);
    if (count === 2) warnings.push(`重複コンポーネント: ${c.name}`);

    if (c.variants) {
      for (const [key, values] of Object.entries(c.variants)) {
        if (!Array.isArray(values) || values.length === 0) {
          warnings.push(`${c.name}: バリアント ${key} の値が空`);
        }
      }
    }
  }

  return { errors, warnings };
}

export function validateCatalog(input: {
  components: CatalogComponent[];
  tokens: DesignToken[];
}): ValidationResult {
  const c = validateComponents(input.components);
  const t = validateTokens(input.tokens);
  return {
    errors: [...c.errors, ...t.errors],
    warnings: [...c.warnings, ...t.warnings],
  };
}
