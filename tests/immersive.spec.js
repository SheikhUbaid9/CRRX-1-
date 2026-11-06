import { test, expect } from "@playwright/test";
import { pdfFixture } from "./pdfFixture.js";

test("walk, pick up a PDF, turn its pages and retain reader annotations", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Enter the room" }).click();
  await page
    .locator(".walking-room canvas")
    .click({ position: { x: 50, y: 150 } });
  await expect
    .poll(() => page.evaluate(() => !!document.pointerLockElement))
    .toBe(true);
  await page.keyboard.press("KeyE");
  await expect(page.locator(".shelf-picker")).toHaveCount(0);
  await page.keyboard.down("KeyW");
  await expect(page.locator(".interaction-hint")).toContainText("Pick a book", {
    timeout: 20000,
  });
  await page.keyboard.up("KeyW");
  await page.keyboard.press("KeyE");
  await expect(page.locator(".shelf-picker")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!document.pointerLockElement))
    .toBe(false);
  await page.getByRole("button", { name: "Close bookshelf" }).click();
  await page.getByRole("button", { name: "Exit room" }).click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "Chapters.pdf",
      mimeType: "application/pdf",
      buffer: pdfFixture(),
    });
  await expect(
    page.getByRole("heading", { name: "Chapters", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enter the room" }).click();
  await page.getByRole("button", { name: "Browse your books" }).click();
  await page.locator(".shelf-picks button").first().click();
  const next = page.getByRole("button", { name: "Next spread", exact: true });
  const previous = page.getByRole("button", {
    name: "Previous spread",
    exact: true,
  });
  await expect(next).toBeEnabled({ timeout: 20000 });
  await expect(previous).toBeDisabled();
  await next.click();
  await expect(page.locator(".held-controls")).toContainText("Pages 3–4 of 5", {
    timeout: 20000,
  });
  await expect(next).toBeEnabled({ timeout: 20000 });
  await next.click();
  await expect(page.locator(".held-controls")).toContainText("Pages 5–5 of 5", {
    timeout: 20000,
  });
  await expect(previous).toBeEnabled({ timeout: 20000 });
  await expect(next).toBeDisabled();
  await previous.click();
  await expect(page.locator(".held-controls")).toContainText("Pages 3–4 of 5", {
    timeout: 20000,
  });
  await expect(previous).toBeEnabled({ timeout: 20000 });
  await page
    .locator(".walking-room canvas")
    .click({ position: { x: 50, y: 150 } });
  await expect
    .poll(() => page.evaluate(() => !!document.pointerLockElement))
    .toBe(true);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".held-controls")).toContainText("Pages 1–2 of 5", {
    timeout: 20000,
  });
  await expect(next).toBeEnabled({ timeout: 20000 });
  await page.keyboard.press("KeyF");
  await expect(page.locator(".reader")).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!document.pointerLockElement))
    .toBe(false);
  const text = page
    .locator(".textLayer span")
    .filter({ hasText: "A quiet place to read." });
  await expect(text).toHaveCount(1);
  await text.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });
  await page.getByRole("button", { name: "Save highlight" }).click();
  await expect(page.locator(".quote")).toHaveText("A quiet place to read.");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".pagination")).toContainText("Page 2");
  await page.getByRole("button", { name: "Close reader" }).click();
  await page.reload();
  await page.getByRole("heading", { name: "Chapters", exact: true }).click();
  await expect(page.locator(".pagination")).toContainText("Page 2");
  await expect(page.locator(".quote")).toHaveText("A quiet place to read.");
  await page.locator(".quote").click();
  await expect(page.locator(".pagination")).toContainText("Page 1");
  await page.getByRole("button", { name: "Remove highlight" }).click();
  await expect(page.locator(".quote")).toHaveCount(0);
  await page.getByRole("button", { name: "Close reader" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
