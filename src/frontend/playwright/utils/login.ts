import { Page } from "@playwright/test";
import { getByID, getByTestID, getByName } from "./selectors";

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto("http://frontend.genepinet.localdev:8000/"); // https://staging.czgenepi.org
  await page.locator(getByTestID("navbar-sign-in-link")).click(); // text="Sign in"
  await page.locator(getByID("Input_Username")).fill(username); //id=username
  await page.locator(getByID("Input_Password")).fill(password); //id=password

  await Promise.all([
    page.waitForNavigation(),
    page.locator(getByName("Input.Button")).first().click(), //button[type=submit] >> "Continue"
  ]);
}
