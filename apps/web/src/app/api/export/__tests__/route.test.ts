import { describe, it, expect } from "vitest";
import { COLORS, GREY_SCALE, TYPOGRAPHY, SPACING, SHAPE, COMPONENT_META, getAllColors } from "../../../../lib/design-tokens";

// Export API が返すペイロードの構造テスト
// （Next.js route handler は直接テストしにくいため、データソースを検証）

describe("Export API payload 構造", () => {
  it("colors.light が Figma プラグインの期待する形式", () => {
    const light = getAllColors("light");
    // プラグインは Record<string, string> を期待
    for (const [key, val] of Object.entries(light)) {
      expect(typeof key).toBe("string");
      expect(typeof val).toBe("string");
      expect(val).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("colors.dark が colors.light と同じキーセット", () => {
    const lightKeys = Object.keys(getAllColors("light")).sort();
    const darkKeys = Object.keys(getAllColors("dark")).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("typography の各エントリが Figma プラグインの期待するフィールドを持つ", () => {
    // プラグインは { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing? } を期待
    for (const [name, token] of Object.entries(TYPOGRAPHY)) {
      expect(token).toHaveProperty("fontFamily");
      expect(token).toHaveProperty("fontWeight");
      expect(token).toHaveProperty("fontSize");
      expect(token).toHaveProperty("lineHeight");
      // fontWeight が Figma の mapWeight で変換可能な値
      expect(["Regular", "Bold", "SemiBold"]).toContain(token.fontWeight);
    }
  });

  it("spacing.values が全て spacing.base の倍数", () => {
    for (const val of SPACING.values) {
      expect(val % SPACING.base).toBe(0);
    }
  });

  it("components が配列で name/description を持つ", () => {
    expect(Array.isArray(COMPONENT_META)).toBe(true);
    for (const comp of COMPONENT_META) {
      expect(comp).toHaveProperty("name");
      expect(comp).toHaveProperty("description");
      expect(comp).toHaveProperty("category");
    }
  });
});

describe("Figma プラグイン互換性", () => {
  it("hexToRgb 変換が正しく動作する", () => {
    // プラグイン側の hexToRgb と同じロジック
    function hexToRgb(hex: string) {
      return {
        r: parseInt(hex.substring(1, 3), 16) / 255,
        g: parseInt(hex.substring(3, 5), 16) / 255,
        b: parseInt(hex.substring(5, 7), 16) / 255,
      };
    }

    const rgb = hexToRgb("#2642be");
    expect(rgb.r).toBeCloseTo(0.149, 2);
    expect(rgb.g).toBeCloseTo(0.259, 2);
    expect(rgb.b).toBeCloseTo(0.745, 2);
  });

  it("mapWeight 変換が正しく動作する", () => {
    // プラグイン側の mapWeight と同じロジック
    function mapWeight(weight: string): string {
      if (weight === "SemiBold") return "Semi Bold";
      if (weight === "Bold") return "Bold";
      return "Regular";
    }

    expect(mapWeight("Bold")).toBe("Bold");
    expect(mapWeight("SemiBold")).toBe("Semi Bold");
    expect(mapWeight("Regular")).toBe("Regular");

    // TYPOGRAPHY の全 fontWeight が変換可能
    for (const token of Object.values(TYPOGRAPHY)) {
      const mapped = mapWeight(token.fontWeight);
      expect(["Regular", "Bold", "Semi Bold"]).toContain(mapped);
    }
  });

  it("コンポーネント名の小文字正規化照合が動作する", () => {
    // プラグイン側の照合ロジック
    function normalize(name: string): string {
      return name.toLowerCase().replace(/\s+/g, "");
    }

    // COMPONENT_META の名前が正規化後も一意
    const normalized = COMPONENT_META.map((m) => normalize(m.name));
    expect(new Set(normalized).size).toBe(normalized.length);

    // Figma コンポーネント名との照合テスト
    expect(normalize("Button")).toBe("button");
    expect(normalize("LinearProgress")).toBe("linearprogress");
    expect(normalize("Icon Button")).toBe("iconbutton");  // Figma名にスペースがある場合
  });
});
