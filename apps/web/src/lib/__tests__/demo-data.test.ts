import { describe, it, expect } from "vitest";
import { generateCode } from "../demo-data";

describe("generateCode", () => {
  describe("undefined / null を出力しない", () => {
    it("chip: size が undefined でも size=\"undefined\" にならない", () => {
      const code = generateCode("chip", { label: "チップ", variant: "filled", color: "warning" });
      expect(code).not.toContain("undefined");
    });

    it("button: 全 props が undefined でも壊れない", () => {
      const code = generateCode("button", {});
      expect(code).not.toContain("undefined");
      expect(code).not.toContain("null");
      expect(code).toContain("Button");
    });

    it("alert: props なしでも有効な JSX", () => {
      const code = generateCode("alert", {});
      expect(code).not.toContain("undefined");
      expect(code).toContain("Alert");
    });
  });

  describe("デフォルト値は省略される", () => {
    it("button: variant=contained は省略", () => {
      const code = generateCode("button", { variant: "contained", color: "primary", size: "medium" });
      expect(code).not.toContain('variant=');
      expect(code).not.toContain('color=');
      expect(code).not.toContain('size=');
    });

    it("chip: variant=filled, color=primary は省略", () => {
      const code = generateCode("chip", { variant: "filled", color: "primary", size: "medium" });
      expect(code).not.toContain('variant=');
      expect(code).not.toContain('color=');
      expect(code).not.toContain('size=');
    });

    it("chip: color=warning は出力される", () => {
      const code = generateCode("chip", { variant: "filled", color: "warning" });
      expect(code).toContain('color="warning"');
      expect(code).not.toContain('variant=');
    });
  });

  describe("汎用コード生成（default case）", () => {
    it("未知のコンポーネントでも有効なコードを生成", () => {
      const code = generateCode("slider", { min: "0", max: "100" });
      expect(code).toContain("Slider");
      expect(code).toContain('min="0"');
      expect(code).toContain('max="100"');
    });

    it("undefined 値はフィルタリング", () => {
      const code = generateCode("switch", { checked: "true", size: undefined });
      expect(code).not.toContain("undefined");
      expect(code).toContain('checked="true"');
    });
  });
});

describe("バリアント値の変換", () => {
  // page.tsx の variant 生成ロジックを単体テスト
  function generateVariantCombinations(
    figmaVariants: Record<string, string[]>
  ): Record<string, string>[] {
    const variantKeys = Object.keys(figmaVariants);
    if (variantKeys.length === 0) return [];

    let combinations: Record<string, string>[] = [{}];
    for (const key of variantKeys) {
      const values = figmaVariants[key];
      const expanded: Record<string, string>[] = [];
      for (const combo of combinations) {
        for (const val of values) {
          expanded.push({
            ...combo,
            [key.charAt(0).toLowerCase() + key.slice(1)]: val.toLowerCase(),
          });
        }
      }
      combinations = expanded;
    }
    return combinations;
  }

  it("Figma バリアント名が lowercase に変換される", () => {
    const combos = generateVariantCombinations({
      Variant: ["Filled", "Outlined"],
      Color: ["Primary", "Warning"],
    });

    expect(combos).toHaveLength(4);
    for (const combo of combos) {
      // キーが lowercase
      expect(combo).toHaveProperty("variant");
      expect(combo).toHaveProperty("color");
      // 値が lowercase
      expect(combo.variant).toMatch(/^[a-z]+$/);
      expect(combo.color).toMatch(/^[a-z]+$/);
    }
  });

  it("MUI の有効な Props 値のみが生成される", () => {
    const validVariants = ["filled", "outlined"];
    const validColors = ["primary", "secondary", "success", "error", "warning", "info"];

    const combos = generateVariantCombinations({
      Variant: ["Filled", "Outlined"],
      Color: ["Primary", "Secondary", "Success", "Error", "Warning"],
    });

    for (const combo of combos) {
      expect(validVariants).toContain(combo.variant);
      expect(validColors).toContain(combo.color);
    }
  });

  it("単一バリアントでも動作する", () => {
    const combos = generateVariantCombinations({
      Severity: ["Success", "Warning", "Error", "Info"],
    });

    expect(combos).toHaveLength(4);
    expect(combos[0]).toEqual({ severity: "success" });
    expect(combos[3]).toEqual({ severity: "info" });
  });

  it("空のバリアントは空配列を返す", () => {
    const combos = generateVariantCombinations({});
    expect(combos).toHaveLength(0);
  });
});
