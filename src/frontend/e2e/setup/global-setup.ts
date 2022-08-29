import { chromium, FullConfig } from "@playwright/test";
import { getByID, getByTestID } from "../utils/selectors";

const fs = require("fs");

const username = process.env.USERNAME ?? "";
const password = process.env.PASSWORD ?? "";

async function globalSetup(config: FullConfig): Promise<void> {
  const { storageState } = config.projects[0].use;
  const cookieStorage = "e2e/storage/cookies.json";
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();

  const page = await browser.newPage();
  await page.goto(baseURL as string);
  await page.locator(getByTestID("navbar-sign-in-link")).click();
  await page.locator(getByID("username")).first().fill(username);
  await page.locator(getByID("password")).first().fill(password);
  await page.locator('button[type=submit] >> "Continue"').first().click();
  await page.context().storageState({ path: storageState as string });

  const cookies = await page.context().cookies();
  const cookieString = JSON.stringify(cookies);
  fs.writeFileSync(cookieStorage, cookieString);

  const cookieJson = JSON.parse(cookieString) as Array<any>;
  const cookie = cookieJson.find((item) => item["name"] == "session");
  process.env.COOKIES = cookie.value;
  console.log(cookie.value);
  fs.writeFileSync(cookieStorage, cookieString);

  //intercept get user details request and save group id
  // await page.route("**/v2/users/me", async (route) => {
  //   await page.request.fetch(route.request()).then((b) => {
  //     const data = JSON.parse(b.toString());
  //     console.log(data)
  //     console.log("***********************")
  //     process.env.GROUPID = data.group.id;
  //   });
  // });
  await browser.close();
}
export default globalSetup;
