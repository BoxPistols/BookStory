import { describe, it, expect } from "vitest";
import {
  COLORS,
  GREY_SCALE,
  TYPOGRAPHY,
  SPACING,
  SHAPE,
  COMPONENT_META,
  toMuiPalette,
  getAllColors,
} from "../design-tokens";

// --- カラートークン ---
describe("COLORS", () => {
  it("light/dark 両モードで同じキーセット", () => {
    const lightKeys = Object.keys(COLORS.light).sort();
    const darkKeys = Object.keys(COLORS.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it("全カラーが有効な hex 形式", () => {
    const hexRegex = /^#[0-9a-f]{6}$/;
    for (const hex of Object.values(COLORS.light)) {
      expect(hex).toMatch(hexRegex);
    }
    for (const hex of Object.values(COLORS.dark)) {
      expect(hex).toMatch(hexRegex);
    }
  });

  it("13 のテーマカラーが存在", () => {
    expect(Object.keys(COLORS.light)).toHaveLength(13);
  });

  it("必須カラーが含まれる", () => {
    const required = ["Brand/Primary", "Semantic/Success", "Semantic/Error", "Surface/Background", "Surface/Paper"];
    for (const key of required) {
      expect(COLORS.light).toHaveProperty(key);
      expect(COLORS.dark).toHaveProperty(key);
    }
  });
});

describe("GREY_SCALE", () => {
  it("10 段階のグレーが存在", () => {
    expect(Object.keys(GREY_SCALE)).toHaveLength(10);
  });

  it("Grey/50 が最も明るく Grey/900 が最も暗い", () => {
    const toBrightness = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return r + g + b;
    };
    expect(toBrightness(GREY_SCALE["Grey/50"])).toBeGreaterThan(toBrightness(GREY_SCALE["Grey/900"]));
  });
});

// --- タイポグラフィ ---
describe("TYPOGRAPHY", () => {
  it("21 スタイルが定義されている", () => {
    expect(Object.keys(TYPOGRAPHY)).toHaveLength(21);
  });

  it("全エントリが必須フィールドを持つ", () => {
    for (const [name, token] of Object.entries(TYPOGRAPHY)) {
      expect(token.fontFamily).toBe("Inter");
      expect(["Regular", "Bold", "SemiBold"]).toContain(token.fontWeight);
      expect(token.fontSize).toBeGreaterThan(0);
      expect(token.lineHeight).toBeGreaterThan(0);
    }
  });

  it("Heading は Body より fontSize が大きい", () => {
    expect(TYPOGRAPHY["Heading/H5"].fontSize).toBeGreaterThanOrEqual(TYPOGRAPHY["Body/Body 1"].fontSize);
  });
});

// --- スペーシング ---
describe("SPACING", () => {
  it("base が 4", () => {
    expect(SPACING.base).toBe(4);
  });

  it("全値が base の倍数", () => {
    for (const val of SPACING.values) {
      expect(val % SPACING.base).toBe(0);
    }
  });

  it("値が昇順", () => {
    for (let i = 1; i < SPACING.values.length; i++) {
      expect(SPACING.values[i]).toBeGreaterThan(SPACING.values[i - 1]);
    }
  });
});

// --- toMuiPalette ---
describe("toMuiPalette", () => {
  it("light モードで正しい MUI 構造を返す", () => {
    const palette = toMuiPalette("light");
    expect(palette.mode).toBe("light");
    expect(palette.primary.main).toBe("#2642be");
    expect(palette.primary.light).toBe("#5c6fd6");
    expect(palette.primary.dark).toBe("#1a2c80");
    expect(palette.error.main).toBe("#da3737");
    expect(palette.background.default).toBe("#faf8fc");
    expect(palette.text.primary).toBe("#2d1f4e");
    expect(palette.divider).toBe("#e8e0f0");
  });

  it("dark モードで正しい MUI 構造を返す", () => {
    const palette = toMuiPalette("dark");
    expect(palette.mode).toBe("dark");
    expect(palette.primary.main).toBe("#5c6fd6");
    expect(palette.background.default).toBe("#0f0d1a");
  });

  it("COLORS の値と完全一致", () => {
    const palette = toMuiPalette("light");
    expect(palette.primary.main).toBe(COLORS.light["Brand/Primary"]);
    expect(palette.secondary.main).toBe(COLORS.light["Brand/Secondary"]);
    expect(palette.success.main).toBe(COLORS.light["Semantic/Success"]);
  });
});

// --- getAllColors ---
describe("getAllColors", () => {
  it("テーマカラー + Grey scale を含む 23 色", () => {
    const all = getAllColors("light");
    expect(Object.keys(all)).toHaveLength(23);
  });

  it("Grey scale が含まれる", () => {
    const all = getAllColors("light");
    expect(all["Grey/500"]).toBe("#9e9e9e");
  });

  it("テーマカラーが含まれる", () => {
    const all = getAllColors("dark");
    expect(all["Brand/Primary"]).toBe(COLORS.dark["Brand/Primary"]);
  });
});

// --- COMPONENT_META ---
describe("COMPONENT_META", () => {
  it("29 コンポーネントが定義されている", () => {
    expect(COMPONENT_META).toHaveLength(29);
  });

  it("全エントリが name と description を持つ", () => {
    for (const meta of COMPONENT_META) {
      expect(meta.name.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it("名前が重複しない", () => {
    const names = COMPONENT_META.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("カテゴリが有効な値", () => {
    const validCategories = ["input", "display", "navigation", "feedback", "layout", "surface"];
    for (const meta of COMPONENT_META) {
      expect(validCategories).toContain(meta.category);
    }
  });
});

// --- SHAPE ---
describe("SHAPE", () => {
  it("borderRadius が正の数", () => {
    expect(SHAPE.borderRadius).toBeGreaterThan(0);
  });
});
