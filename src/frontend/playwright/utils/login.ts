import { Page } from "@playwright/test";
import { getByID, getByTestID, getByName, SELECTORS } from "./selectors";

//todo: we need to get variables based on environment
const ENV = process.env.ENV as string;

export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  //await page.goto("http://frontend.genepinet.localdev:8000/"); // https://staging.czgenepi.org
  await page.locator(getByTestID("navbar-sign-in-link")).click(); // text="Sign in"
  await page.locator(getByID(SELECTORS.DEV.USERNAME)).first().fill(username); //id=username
  await page.locator(getByID(SELECTORS.DEV.PASSWORD)).first().fill(password); //id=password

  await Promise.all([
    page.waitForNavigation(),
    page.locator(getByName(SELECTORS.DEV.LOGIN_BTN)).first().click(), //button[type=submit] >> "Continue"
  ]);
}
