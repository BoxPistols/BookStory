import { describe, it, expect } from "vitest";
import { validateCatalog, validateTokens, validateComponents } from "../catalog-validate";
import type { DesignToken, CatalogComponent } from "@bookstory/core";

describe("validateTokens", () => {
  it("正常なトークンは warning 0", () => {
    const res = validateTokens([
      { name: "Brand/Primary", type: "color", value: { r: 0.1, g: 0.2, b: 0.3, a: 1 } },
      { name: "Spacing/4", type: "spacing", value: 16 },
      {
        name: "Heading/H1",
        type: "typography",
        value: { fontFamily: "Inter", fontSize: 16, fontWeight: "Bold" } as DesignToken["value"],
      } as DesignToken,
    ]);
    expect(res.errors).toEqual([]);
    expect(res.warnings).toEqual([]);
  });

  it("未解決の VARIABLE_ALIAS は warning", () => {
    const res = validateTokens([
      { name: "Brand/Primary", type: "color", value: { type: "VARIABLE_ALIAS", id: "V:1" } as unknown as DesignToken["value"] } as DesignToken,
    ]);
    expect(res.warnings.some((w) => w.includes("Variable Alias"))).toBe(true);
  });

  it("重複トークンは warning", () => {
    const res = validateTokens([
      { name: "dup", type: "color", value: "#fff" } as DesignToken,
      { name: "dup", type: "color", value: "#000" } as DesignToken,
    ]);
    expect(res.warnings.some((w) => w.includes("重複"))).toBe(true);
  });

  it("カラートークンが不正値なら warning", () => {
    const res = validateTokens([
      { name: "Brand/X", type: "color", value: "not-a-color" } as DesignToken,
    ]);
    expect(res.warnings.some((w) => w.includes("Brand/X"))).toBe(true);
  });

  it("Spacing が文字列なら warning", () => {
    const res = validateTokens([
      { name: "Spacing/4", type: "spacing", value: "16" as unknown as number } as DesignToken,
    ]);
    expect(res.warnings.some((w) => w.includes("Spacing"))).toBe(true);
  });

  it("Typography の必須欠損は warning", () => {
    const res = validateTokens([
      { name: "Heading/X", type: "typography", value: { fontSize: 16 } as DesignToken["value"] } as DesignToken,
    ]);
    expect(res.warnings.some((w) => w.includes("fontFamily"))).toBe(true);
  });

  it("名前のないトークンは error", () => {
    const res = validateTokens([
      { name: "", type: "color", value: "#fff" } as DesignToken,
    ]);
    expect(res.errors.length).toBeGreaterThan(0);
  });
});

describe("validateComponents", () => {
  function mk(partial: Partial<CatalogComponent> & { name: string; id: string }): CatalogComponent {
    return { category: "Figma", props: [], ...partial };
  }

  it("正常系", () => {
    const res = validateComponents([mk({ id: "1", name: "Button" })]);
    expect(res.errors).toEqual([]);
    expect(res.warnings).toEqual([]);
  });

  it("id/name が無ければ error", () => {
    const res = validateComponents([mk({ id: "", name: "X" })]);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("空のバリアントは warning", () => {
    const res = validateComponents([
      mk({ id: "1", name: "Button", variants: { Size: [] } }),
    ]);
    expect(res.warnings.some((w) => w.includes("Size"))).toBe(true);
  });
});

describe("validateCatalog", () => {
  it("error があれば errors を統合、warnings も統合", () => {
    const res = validateCatalog({
      components: [{ id: "", name: "X", category: "Figma", props: [] } as CatalogComponent],
      tokens: [{ name: "dup", type: "color", value: "#fff" } as DesignToken, { name: "dup", type: "color", value: "#000" } as DesignToken],
    });
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});
