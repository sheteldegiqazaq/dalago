import { expect, type Page, test } from "@playwright/test";

/**
 * Полный демо-сценарий через интерфейс:
 * покупатель создаёт заявку → поставщик отвечает → покупатель принимает.
 */
const stamp = Date.now().toString().slice(-6);
const requestTitle = `E2E картофель ${stamp}`;

async function demoLogin(page: Page, as: "buyer" | "supplier") {
  await page.goto("/ru/demo");
  await page
    .getByRole("button", {
      name: as === "buyer" ? "Войти как покупатель" : "Войти как поставщик",
    })
    .first()
    .click();
  await expect(page).toHaveURL(/\/ru\/dashboard/);
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Выйти" }).first().click();
  await expect(page).toHaveURL(/\/ru$/);
}

test("language switch changes the whole interface and persists", async ({
  page,
}) => {
  await page.goto("/kk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Фермерлер мен жергілікті өндірушілерден",
  );
  // В dev-режиме первая гидратация медленная: повторяем клик, пока он не сработает
  await expect(async () => {
    await page.getByRole("button", { name: "Русский" }).click();
    await expect(page).toHaveURL(/\/ru$/, { timeout: 2000 });
  }).toPass({ timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Оптовые закупки напрямую",
  );
  await page.goto("/");
  await expect(page).toHaveURL(/\/ru$/);
  await expect(async () => {
    await page.getByRole("button", { name: "Қазақша" }).click();
    await expect(page).toHaveURL(/\/kk$/, { timeout: 2000 });
  }).toPass({ timeout: 30_000 });
});

test("catalog filters and AI search use real data", async ({ page }) => {
  await page.goto("/ru/catalog?category=vegetables&sort=price_asc");
  await expect(
    page.getByRole("heading", { name: /Найдено|Найден/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Капуста белокочанная" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Мёд горный разнотравье" }),
  ).toHaveCount(0);

  await page
    .getByLabel("Опишите, что нужно")
    .fill("нужно 50 кг говядины для кафе в Семее до пятницы");
  await page.getByRole("button", { name: "Подобрать" }).click();
  await expect(page.getByText("ИИ понял запрос так:")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Говядина охлаждённая" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Резервный режим|Работает модель Claude/),
  ).toBeVisible();
});

test("buyer creates a request, supplier offers, buyer accepts", async ({
  page,
}) => {
  await demoLogin(page, "buyer");
  await page.goto("/ru/requests/new");
  await page.getByLabel("Что нужно").fill(requestTitle);
  await page.getByLabel("Объём").fill("250");
  await page.getByRole("button", { name: "Разместить заявку" }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: requestTitle }),
  ).toBeVisible();
  await expect(page.getByText("Ждёт предложений").first()).toBeVisible();
  const requestUrl = page.url();
  await logout(page);

  await demoLogin(page, "supplier");
  await page.goto(requestUrl);
  await page.getByLabel("Цена за ед., ₸").fill("138");
  await page.getByLabel(/Доставка, ₸/).fill("2500");
  await page.getByRole("button", { name: "Отправить предложение" }).click();
  await expect(
    page.getByRole("heading", { name: "Ваше предложение" }),
  ).toBeVisible();
  await logout(page);

  await demoLogin(page, "buyer");
  await page.goto(requestUrl);
  await expect(page.getByText("Есть предложения").first()).toBeVisible();
  await page.getByRole("button", { name: "Принять" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Принять" })
    .click();
  await expect(page.getByText("Поставщик выбран").first()).toBeVisible();
  await expect(
    page.getByText("Заявка завершена, изменения больше невозможны."),
  ).toBeVisible();
});

test("protected pages ask to log in and keep working on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru/dashboard");
  await expect(page.getByText("Войдите, чтобы продолжить")).toBeVisible();
  await page.goto("/ru");
  await page.getByRole("button", { name: "Меню" }).click();
  await page
    .locator("#mobile-menu")
    .getByRole("link", { name: "Каталог" })
    .click();
  await expect(page).toHaveURL(/\/ru\/catalog/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
