import { expect, test } from "@playwright/test";
import { getByTestID } from "../utils/selectors";
import { FOOTER } from "../utils/constants";

test.describe("Home page tests", () => {
  test("Should verify home page", async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    await page.goto(`${baseURL}` as string);
    await expect(page.locator(getByTestID("navbar-landing"))).toBeVisible();
    await expect(
      page.locator(getByTestID("navbar-sign-in-link"))
    ).toBeVisible();
    await expect(page.locator(getByTestID("logo"))).toBeVisible();
    Object.keys(FOOTER).forEach((key) => {
      expect(page.locator(`a:has-text("${key}")`).first()).toHaveAttribute(
        "href",
        FOOTER[key]
      );
    });
  });
});
