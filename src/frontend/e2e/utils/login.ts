import { Page } from "@playwright/test";
import { getByID, getByTestID } from "./selectors";

import path from "path";
import dotenv from "dotenv";
import { ENVIRONMENT } from "./constants";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

export async function login(
  page: Page,
  user: string,
  pwd: string
): Promise<void> {
  /**
   * The login UI in dev is different so we need a but logic to handle
   * both
   */
  let username = user;
  let password = pwd;
  let usernameInputSelector = "username";
  let passwordInputSelector = "password";
  let buttonText = "Continue";
  await page.goto(`${process.env.BASEURL}`);
  await page.locator(getByTestID("navbar-sign-in-link")).click();

  if (process.env.NODE_ENV === ENVIRONMENT.DEV) {
    usernameInputSelector = "Input_Username";
    passwordInputSelector = "Input_Password";
    buttonText = "Login";
    username = `${process.env.USERNAME}`;
    password = `${process.env.PASSWORD}`;
  }

  // actual login
  await page.locator(getByID(usernameInputSelector)).fill(username);
  await page.locator(getByID(passwordInputSelector)).fill(password);

  await Promise.all([
    page.waitForNavigation(),
    page.locator(`button[type=submit] >> "${buttonText}"`).click(),
  ]);
}
