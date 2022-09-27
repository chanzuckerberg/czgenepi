import { Page } from "@playwright/test";
import { getByID, getByTestID } from "./selectors";

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto(`${process.env.BASEURL}`);
  await page.locator(getByTestID("navbar-sign-in-link")).click();
  if (process.env.NODE_ENV === "development") {
    await page.locator(getByID("Input_Username")).first().fill("User1");
    await page.locator(getByID("Input_Password")).first().fill("pwd");

    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type=submit] >> "Login"').first().click(),
    ]);
  } else {
    await page.locator(getByID("username")).first().fill(username);
    await page.locator(getByID("password")).first().fill(password);

    await Promise.all([
      page.waitForNavigation(),
      page.locator('button[type=submit] >> "Continue"').first().click(),
    ]);
  }
  process.env.SESSION_STORAGE = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
}
