// 旧カタログと新カタログの差分を算出
// publish 時のコミットメッセージ生成に使用

import type { CatalogComponent, DesignToken } from "@bookstory/core";

export interface CatalogLike {
  components: CatalogComponent[];
  tokens?: DesignToken[];
}

export interface ComponentDiff {
  added: string[];
  removed: string[];
  modified: { name: string; reasons: string[] }[];
}

export interface TokenDiff {
  added: string[];
  removed: string[];
  modified: { name: string; reason: string }[];
}

export interface CatalogDiff {
  components: ComponentDiff;
  tokens: TokenDiff;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const keys = Object.keys(v as Record<string, unknown>).sort();
      const sorted: Record<string, unknown> = {};
      for (const k of keys) sorted[k] = (v as Record<string, unknown>)[k];
      return sorted;
    }
    return v;
  });
}

function variantSignature(variants?: Record<string, string[]>): string {
  if (!variants) return "";
  const keys = Object.keys(variants).sort();
  return keys.map((k) => `${k}=[${[...variants[k]].sort().join("|")}]`).join(";");
}

function compareComponent(oldC: CatalogComponent, newC: CatalogComponent): string[] {
  const reasons: string[] = [];
  if ((oldC.description || "") !== (newC.description || "")) reasons.push("description");
  if (variantSignature(oldC.variants) !== variantSignature(newC.variants)) reasons.push("variants");
  if ((oldC.props?.length ?? 0) !== (newC.props?.length ?? 0)) reasons.push("props");
  if (stableJson(oldC.nodeTree) !== stableJson(newC.nodeTree)) reasons.push("nodeTree");
  return reasons;
}

function compareToken(oldT: DesignToken, newT: DesignToken): string | null {
  if (oldT.type !== newT.type) return `type ${oldT.type}→${newT.type}`;
  if (stableJson(oldT.value) !== stableJson(newT.value)) return "value";
  if (stableJson(oldT.modes) !== stableJson(newT.modes)) return "modes";
  return null;
}

export function diffCatalogs(oldCat: CatalogLike | null | undefined, newCat: CatalogLike): CatalogDiff {
  const oldComps = new Map<string, CatalogComponent>();
  for (const c of oldCat?.components ?? []) oldComps.set(c.name, c);
  const newComps = new Map<string, CatalogComponent>();
  for (const c of newCat.components) newComps.set(c.name, c);

  const componentDiff: ComponentDiff = { added: [], removed: [], modified: [] };
  for (const name of newComps.keys()) {
    if (!oldComps.has(name)) componentDiff.added.push(name);
    else {
      const reasons = compareComponent(oldComps.get(name)!, newComps.get(name)!);
      if (reasons.length) componentDiff.modified.push({ name, reasons });
    }
  }
  for (const name of oldComps.keys()) {
    if (!newComps.has(name)) componentDiff.removed.push(name);
  }

  const oldToks = new Map<string, DesignToken>();
  for (const t of oldCat?.tokens ?? []) oldToks.set(t.name, t);
  const newToks = new Map<string, DesignToken>();
  for (const t of newCat.tokens ?? []) newToks.set(t.name, t);

  const tokenDiff: TokenDiff = { added: [], removed: [], modified: [] };
  for (const name of newToks.keys()) {
    if (!oldToks.has(name)) tokenDiff.added.push(name);
    else {
      const reason = compareToken(oldToks.get(name)!, newToks.get(name)!);
      if (reason) tokenDiff.modified.push({ name, reason });
    }
  }
  for (const name of oldToks.keys()) {
    if (!newToks.has(name)) tokenDiff.removed.push(name);
  }

  return { components: componentDiff, tokens: tokenDiff };
}

export function isEmptyDiff(d: CatalogDiff): boolean {
  return (
    d.components.added.length === 0 &&
    d.components.removed.length === 0 &&
    d.components.modified.length === 0 &&
    d.tokens.added.length === 0 &&
    d.tokens.removed.length === 0 &&
    d.tokens.modified.length === 0
  );
}

function truncateList(names: string[], max = 5): string {
  if (names.length <= max) return names.join(", ");
  return `${names.slice(0, max).join(", ")} 他${names.length - max}件`;
}

export function buildCommitMessage(diff: CatalogDiff, totals: { components: number; tokens: number }): string {
  const head = `BookStory: Figmaデザイン同期 (${totals.components} components, ${totals.tokens} tokens)`;
  if (isEmptyDiff(diff)) {
    return `${head}\n\n変更なし（再同期）`;
  }

  const lines: string[] = [head, ""];
  const compLine: string[] = [];
  if (diff.components.added.length) compLine.push(`+${diff.components.added.length}`);
  if (diff.components.modified.length) compLine.push(`~${diff.components.modified.length}`);
  if (diff.components.removed.length) compLine.push(`-${diff.components.removed.length}`);
  if (compLine.length) lines.push(`Components: ${compLine.join(" / ")}`);

  if (diff.components.added.length) lines.push(`  + ${truncateList(diff.components.added)}`);
  if (diff.components.modified.length) {
    lines.push(
      `  ~ ${truncateList(diff.components.modified.map((m) => `${m.name}(${m.reasons.join(",")})`))}`
    );
  }
  if (diff.components.removed.length) lines.push(`  - ${truncateList(diff.components.removed)}`);

  const tokLine: string[] = [];
  if (diff.tokens.added.length) tokLine.push(`+${diff.tokens.added.length}`);
  if (diff.tokens.modified.length) tokLine.push(`~${diff.tokens.modified.length}`);
  if (diff.tokens.removed.length) tokLine.push(`-${diff.tokens.removed.length}`);
  if (tokLine.length) lines.push(`Tokens: ${tokLine.join(" / ")}`);

  if (diff.tokens.added.length) lines.push(`  + ${truncateList(diff.tokens.added)}`);
  if (diff.tokens.modified.length) {
    lines.push(
      `  ~ ${truncateList(diff.tokens.modified.map((m) => `${m.name}(${m.reason})`))}`
    );
  }
  if (diff.tokens.removed.length) lines.push(`  - ${truncateList(diff.tokens.removed)}`);

  return lines.join("\n");
}
