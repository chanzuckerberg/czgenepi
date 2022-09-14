import { chromium, FullConfig } from "@playwright/test";
import { getByID, getByTestID } from "../utils/selectors";
import path from "path";
import dotenv from 'dotenv';

dotenv.config({path: path.resolve(`.env.${process.env.NODE_ENV}`),});


const username = process.env.USERNAME as string;
const password = process.env.PASSWORD as string;

async function globalSetup(config: FullConfig): Promise<void> {
  const { storageState } = config.projects[0].use;
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();

  const page = await browser.newPage();
  await page.goto(baseURL as string);
  await page.locator(getByTestID("navbar-sign-in-link")).click();
  await page.locator(getByID("username")).first().fill(username);
  await page.locator(getByID("password")).first().fill(password);
  await page.locator('button[type=submit] >> "Continue"').first().click();
  await page.context().storageState({ path: storageState as string });
  await browser.close();
}
export default globalSetup;
