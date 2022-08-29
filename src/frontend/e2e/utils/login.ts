import { Page } from "@playwright/test";
import { getByID, getByTestID } from "./selectors";

//todo: we need to get variables based on environment

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto("https://staging.czgenepi.org");
  await page.locator(getByTestID("navbar-sign-in-link")).click();
  await page.locator(getByID("username")).first().fill(username);
  await page.locator(getByID("password")).first().fill(password);

  await Promise.all([
    page.waitForNavigation(),
    page.locator('button[type=submit] >> "Continue"').first().click(),
    (process.env.SESSION_STORAGE = await page.evaluate(() =>
      JSON.stringify(sessionStorage)
    )),
  ]);
}
