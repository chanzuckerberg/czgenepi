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
   * The login UI in dev is different so we need a logic to handle
   * both
   */
  let username = user;
  let password = pwd;
  let usernameInputSelector = "username";
  let passwordInputSelector = "password";
  let buttonText = "Continue";

  if (process.env.NODE_ENV === ENVIRONMENT.DEV) {
    usernameInputSelector = "Input_Username";
    passwordInputSelector = "Input_Password";
    buttonText = "Login";
    username = `${process.env.USERNAME}`;
    password = `${process.env.PASSWORD}`;

    const authUrl =
      "https://oidc.genepinet.localdev:8443/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fresponse_type%3Dcode%26client_id%3Dlocal-client-id%26redirect_uri%3Dhttp%253A%252F%252Fbackend.genepinet.localdev%253A3000%252Fv2%252Fauth%252Fcallback%26scope%3Dopenid%2520profile%2520email%2520offline_access%26state%3DspMNx91QxfKVyXevXEUsuZasZCUKrD%26nonce%3D3Q04286TSbfqCWtOLE4x";
    await Promise.all([page.waitForNavigation(), await page.goto(authUrl)]);
  } else {
    await Promise.all([
      page.waitForNavigation(),
      await page.goto(`${process.env.BASEURL}`),
      await page.locator(getByTestID("navbar-sign-in-link")).click(),
    ]);
  }

  await Promise.all([
    page.waitForNavigation(),
    // await page.goto(`${process.env.BASEURL}`),
    // await page.locator(getByTestID("navbar-sign-in-link")).click(),

    await page.locator(getByID(usernameInputSelector)).fill(username),
    await page.locator(getByID(passwordInputSelector)).fill(password),
    page.locator(`button[type=submit] >> "${buttonText}"`).click(),
  ]);
}
