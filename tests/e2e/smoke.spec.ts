import { expect, test } from "@playwright/test";

test("a run from the landing page to the first requirement, then to the result", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/?test=1&seed=e2e&speed=10");
  await expect(page).toHaveTitle(/Cartório Simulator/);
  await page.getByTestId("start").click();
  await page
    .getByRole("button", { name: /Take a ticket for Window 3/ })
    .last()
    .click();
  await page.getByRole("button", { name: "Hand in what I have" }).click({ timeout: 30_000 });
  await expect(page.locator(".folder .req").first()).toBeVisible();
  await page.evaluate(() =>
    (window as unknown as { __cartorio: { autoplay(): void } }).__cartorio.autoplay(),
  );
  await expect(page.getByTestId("share")).toContainText("Cartório Simulator nº", {
    timeout: 10_000,
  });
  expect(errors).toEqual([]);
});

test("the language toggle switches to Portuguese", async ({ page }) => {
  await page.goto("/?test=1&seed=e2e");
  await page.getByRole("button", { name: "Mudar para português" }).click();
  await expect(page.locator("h1")).toHaveText("Você só precisa de um carimbo.");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
