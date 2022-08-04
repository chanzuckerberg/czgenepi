import { chromium, FullConfig, BrowserContext } from "@playwright/test";
import { login } from "../utils/login";

const username = process.env.USERNAME ?? "";
const password = process.env.PASSWORD ?? "";

async function globalSetup(
  config: FullConfig,
  context: BrowserContext
): Promise<void> {
  const { storageState } = config.projects[0].use;
  const browser = await chromium.launch();
  context = await browser.newContext();

  const page = await browser.newPage();
  await login(page, username, password);
  // Set session storage in a new context
  const sessionStorage = process.env.SESSION_STORAGE;
  await context.addInitScript((storage) => {
    if (window.location.hostname === "frontend.genepinet.localdev") {
      const entries = JSON.parse(storage);
      Object.keys(entries).forEach((key) => {
        window.sessionStorage.setItem(key, entries[key]);
      });
    }
  }, sessionStorage);
  const actualSession = await page.evaluate(() =>
    JSON.stringify(sessionStorage)
  );
  console.log("SESSION AFTER LOGING " + actualSession);
  process.env.SESSION_STORAGE = actualSession;
  await browser.close();
}
export default globalSetup;
