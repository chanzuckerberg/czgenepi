import { Page } from "@playwright/test";
import { getByID, getByTestID } from "./selectors";

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  page.waitForNavigation();
  await page.goto(`${process.env.BASEURL}`);
  await page.locator(getByTestID("navbar-sign-in-link")).click();
  await page.locator(getByID("username")).first().fill(username);
  await page.locator(getByID("password")).first().fill(password);

  await Promise.all([
    page.waitForNavigation(),
    page.locator('button[type=submit] >> "Continue"').first().click(),
  ]);
}
