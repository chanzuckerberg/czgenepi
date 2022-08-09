import { chromium, BrowserContext } from "@playwright/test";
import { login } from "../utils/login";

const username = process.env.USERNAME ?? "";
const password = process.env.PASSWORD ?? "";

async function globalSetup(
  context: BrowserContext
): Promise<void> {
  const browser = await chromium.launch();
  context = await browser.newContext();

  const page = await browser.newPage();
  await login(page, username, password);
  // Set session storage in a new context
  const sessionStorage = process.env.SESSION_STORAGE;
  console.log("Reading session from storage");
  console.log(sessionStorage);
  await context.addInitScript((storage) => {
    const entries = JSON.parse(storage);
    Object.keys(entries).forEach((key) => {
    window.sessionStorage.setItem(key, entries[key]);
    });
  }, sessionStorage);
  await browser.close();
}
export default globalSetup;
