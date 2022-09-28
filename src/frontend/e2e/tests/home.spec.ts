import { expect, test } from "@playwright/test";
import { getByTestID } from "../utils/selectors";
import { footer } from "../utils/constants";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

test.describe("Home page tests", () => {
  test.only("Should verify home page", async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    await page.goto(`${baseURL}` as string);
    await expect(page.locator(getByTestID("navbar-landing"))).toBeVisible();
    await expect(
      page.locator(getByTestID("navbar-sign-in-link"))
    ).toBeVisible();
    await expect(page.locator(getByTestID("logo"))).toBeVisible();
    Object.keys(footer).forEach(async (key) => {
      await expect(
        await page.locator(`a:has-text("${key}")`).first()
      ).toHaveAttribute("href", footer[key]);
    });
  });
});
