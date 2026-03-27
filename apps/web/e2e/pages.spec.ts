import { test, expect } from "@playwright/test";

// === トークンページ ===

test.describe("Token: Color", () => {
  test("カラートークン一覧が表示される", async ({ page }) => {
    await page.goto("/#figma-token-color");
    await expect(page.locator("text=Color Tokens")).toBeVisible();
    // カラースウォッチが存在
    await expect(page.locator("[class*=MuiPaper]").first()).toBeVisible();
    // 「プレビュー / バリアント / コード」タブが出ない
    await expect(page.locator("text=プレビュー").first()).not.toBeVisible();
  });
});

test.describe("Token: Typography", () => {
  test("タイポグラフィトークン一覧が表示される", async ({ page }) => {
    await page.goto("/#figma-token-typography");
    await expect(page.locator("text=Typography Tokens")).toBeVisible();
    await expect(page.locator("text=The quick brown fox").first()).toBeVisible();
  });
});

test.describe("Token: Spacing", () => {
  test("スペーシングトークン一覧が表示される", async ({ page }) => {
    await page.goto("/#figma-token-spacing");
    await expect(page.locator("text=Spacing Tokens")).toBeVisible();
  });
});

// === コンポーネントページ ===

const COMPONENTS = [
  "button",
  "chip",
  "alert",
  "divider",
];

for (const comp of COMPONENTS) {
  test.describe(`Component: ${comp}`, () => {
    test("プレビューが表示される", async ({ page }) => {
      await page.goto(`/#figma-${comp}`);
      // タイトルが表示
      await expect(page.locator("h5").first()).toBeVisible();
      // 「プレビュー」タブがある
      await expect(page.locator("text=プレビュー")).toBeVisible();
      // プレビュー領域が空でない（「コンポーネントを選択してください」が出ない）
      await expect(page.locator("text=コンポーネントを選択してください")).not.toBeVisible();
    });

    test("バリアントタブが動作する", async ({ page }) => {
      await page.goto(`/#figma-${comp}`);
      const variantTab = page.locator("text=バリアント");
      if (await variantTab.isVisible()) {
        await variantTab.click();
        // バリアントグリッドが表示される（または空でも崩れない）
        await expect(page.locator("h5").first()).toBeVisible();
      }
    });

    test("コードタブにundefinedが出ない", async ({ page }) => {
      await page.goto(`/#figma-${comp}`);
      await page.locator("text=コード").click();
      // "undefined" がコード内に出ない
      const codeBlock = page.locator("pre");
      if (await codeBlock.isVisible()) {
        const text = await codeBlock.textContent();
        expect(text).not.toContain("undefined");
      }
    });
  });
}

// === サイドバー ===

test.describe("Sidebar", () => {
  test("Badge がサブコンポーネントとして展開されない", async ({ page }) => {
    await page.goto("/");
    // "Badge/Primary/Small" がサイドバーに表示されない
    await expect(page.locator("text=Badge/Primary/Small")).not.toBeVisible();
  });

  test("トークンセクションが存在する", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Color")).toBeVisible();
    await expect(page.locator("text=Typography")).toBeVisible();
    await expect(page.locator("text=Spacing")).toBeVisible();
  });
});

// === キーボードナビゲーション ===

test.describe("Keyboard Navigation", () => {
  test("Alt + → で次のコンポーネントに移動", async ({ page }) => {
    await page.goto("/#figma-token-color");
    await page.keyboard.press("Alt+ArrowRight");
    // URL ハッシュが変わる
    const hash = new URL(page.url()).hash;
    expect(hash).not.toBe("#figma-token-color");
    expect(hash.length).toBeGreaterThan(1);
  });

  test("Alt + ← で前のコンポーネントに移動", async ({ page }) => {
    await page.goto("/#figma-chip");
    await page.keyboard.press("Alt+ArrowLeft");
    const hash = new URL(page.url()).hash;
    expect(hash).not.toBe("#figma-chip");
  });
});

// === URL 永続化 ===

test.describe("URL Persistence", () => {
  test("ハッシュ付きURLで直接アクセスできる", async ({ page }) => {
    await page.goto("/#figma-chip");
    await expect(page.locator("h5", { hasText: "Chip" })).toBeVisible();
  });

  test("リロードしても同じページが表示される", async ({ page }) => {
    await page.goto("/#figma-alert");
    await page.reload();
    await expect(page.locator("h5", { hasText: "Alert" })).toBeVisible();
  });
});
