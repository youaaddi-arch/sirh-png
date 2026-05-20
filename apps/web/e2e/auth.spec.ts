import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h2')).toContainText('Bienvenue');

  await page.fill('input[type="email"]', 'admin@pn-groupe.fr');
  await page.fill('input[type="password"]', 'Admin2026!');
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Tableau de bord');
});

test('logout flow', async ({ page }) => {
  await loginAsAdmin(page);
  await page.click('button:has-text("Emir")');
  await page.click('button:has-text("Se déconnecter")');
  await page.waitForURL('/login');
});

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@pn-groupe.fr');
  await page.fill('input[type="password"]', 'Admin2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
