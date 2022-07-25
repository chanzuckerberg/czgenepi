import { Page } from '@playwright/test';

export async function login(
  page: Page,
  username: string,
  password: string,
): Promise<void> {
  await page.goto('https://staging.czgenepi.org');
  await page.locator('text="Sign in"').click();
  await page.locator('id=username').fill(username);
  await page.locator('id=password').fill(password);

  await Promise.all([
    page.waitForNavigation(),
    page.locator('button[type=submit] >> "Continue"').click(),
  ]);
}