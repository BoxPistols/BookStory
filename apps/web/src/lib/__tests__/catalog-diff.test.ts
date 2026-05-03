import { describe, it, expect } from "vitest";
import { diffCatalogs, buildCommitMessage, isEmptyDiff } from "../catalog-diff";
import type { CatalogComponent, DesignToken } from "@bookstory/core";

function comp(partial: Partial<CatalogComponent> & { name: string; id: string }): CatalogComponent {
  return {
    category: "Figma",
    props: [],
    ...partial,
  };
}

function colorTok(name: string, hex: string): DesignToken {
  return { name, type: "color", value: hex };
}

describe("diffCatalogs", () => {
  it("初回（旧なし）は全てを added として扱う", () => {
    const d = diffCatalogs(null, {
      components: [comp({ id: "1", name: "Button" })],
      tokens: [colorTok("Brand/Primary", "#2642be")],
    });
    expect(d.components.added).toEqual(["Button"]);
    expect(d.tokens.added).toEqual(["Brand/Primary"]);
    expect(d.components.removed).toEqual([]);
    expect(d.components.modified).toEqual([]);
  });

  it("同一内容なら empty diff", () => {
    const a = {
      components: [comp({ id: "1", name: "Button", description: "x" })],
      tokens: [colorTok("c", "#fff")],
    };
    const b = {
      components: [comp({ id: "1", name: "Button", description: "x" })],
      tokens: [colorTok("c", "#fff")],
    };
    const d = diffCatalogs(a, b);
    expect(isEmptyDiff(d)).toBe(true);
  });

  it("props の中身（options/default）変更を modified として検出", () => {
    const a = {
      components: [
        comp({
          id: "1",
          name: "Button",
          props: [{ name: "size", type: "select", options: ["S", "M"], defaultValue: "S" }],
        }),
      ],
      tokens: [],
    };
    const b = {
      components: [
        comp({
          id: "1",
          name: "Button",
          props: [{ name: "size", type: "select", options: ["S", "M", "L"], defaultValue: "M" }],
        }),
      ],
      tokens: [],
    };
    const d = diffCatalogs(a, b);
    expect(d.components.modified).toHaveLength(1);
    expect(d.components.modified[0].reasons).toContain("props");
  });

  it("description / variants / nodeTree の変更を検出", () => {
    const a = {
      components: [
        comp({
          id: "1",
          name: "Button",
          description: "old",
          variants: { Size: ["S", "M"] },
          nodeTree: { css: { width: "10px" } },
        }),
      ],
      tokens: [],
    };
    const b = {
      components: [
        comp({
          id: "1",
          name: "Button",
          description: "new",
          variants: { Size: ["S", "M", "L"] },
          nodeTree: { css: { width: "20px" } },
        }),
      ],
      tokens: [],
    };
    const d = diffCatalogs(a, b);
    const mod = d.components.modified[0];
    expect(mod.name).toBe("Button");
    expect(mod.reasons).toContain("description");
    expect(mod.reasons).toContain("variants");
    expect(mod.reasons).toContain("nodeTree");
  });

  it("トークンの value 変更を modified に分類", () => {
    const a = { components: [], tokens: [colorTok("Brand/Primary", "#aaaaaa")] };
    const b = { components: [], tokens: [colorTok("Brand/Primary", "#bbbbbb")] };
    const d = diffCatalogs(a, b);
    expect(d.tokens.modified).toHaveLength(1);
    expect(d.tokens.modified[0].reason).toBe("value");
  });

  it("削除・追加を同時に検出", () => {
    const a = {
      components: [comp({ id: "1", name: "A" }), comp({ id: "2", name: "B" })],
      tokens: [],
    };
    const b = {
      components: [comp({ id: "1", name: "A" }), comp({ id: "3", name: "C" })],
      tokens: [],
    };
    const d = diffCatalogs(a, b);
    expect(d.components.added).toEqual(["C"]);
    expect(d.components.removed).toEqual(["B"]);
  });
});

describe("buildCommitMessage", () => {
  it("変更なしの場合はヘッダー + 変更なし", () => {
    const msg = buildCommitMessage(
      { components: { added: [], removed: [], modified: [] }, tokens: { added: [], removed: [], modified: [] } },
      { components: 3, tokens: 5 }
    );
    expect(msg).toContain("(3 components, 5 tokens)");
    expect(msg).toContain("変更なし");
  });

  it("追加・変更・削除の数とサンプル名を含む", () => {
    const msg = buildCommitMessage(
      {
        components: { added: ["Dialog"], removed: ["Old"], modified: [{ name: "Button", reasons: ["description"] }] },
        tokens: { added: ["c1"], removed: [], modified: [{ name: "c2", reason: "value" }] },
      },
      { components: 10, tokens: 20 }
    );
    expect(msg).toContain("Components: +1 / ~1 / -1");
    expect(msg).toContain("+ Dialog");
    expect(msg).toContain("~ Button(description)");
    expect(msg).toContain("- Old");
    expect(msg).toContain("Tokens: +1 / ~1");
    expect(msg).toContain("c2(value)");
  });

  it("6件以上は省略される", () => {
    const added = ["a", "b", "c", "d", "e", "f", "g"];
    const msg = buildCommitMessage(
      {
        components: { added, removed: [], modified: [] },
        tokens: { added: [], removed: [], modified: [] },
      },
      { components: 7, tokens: 0 }
    );
    expect(msg).toContain("他2件");
  });
});
