import { test, expect } from '@playwright/test';

test('главная открывается', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

test('страница услуг открывается', async ({ page }) => {
  await page.goto('/services');
  await expect(page.locator('h1')).toContainText('Услуги');
});

test('блог открывается', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('h1')).toContainText('Блог');
});

test('форма валидирует пустые поля', async ({ page }) => {
  await page.goto('/contact');
  await page.click('button[type=submit]');
  await expect(page.locator('#cf-status')).toHaveText('Заполните все поля');
});

test('404 работает', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist');
  expect(res?.status()).toBe(404);
});