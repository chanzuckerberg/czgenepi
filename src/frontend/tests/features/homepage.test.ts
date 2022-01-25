import { test, expect } from '@playwright/test';
import { getTestID, getText } from "./utils/selectors";
import { goToPage } from "./utils/helpers";

test.describe("Homepage", () => {
  test("renders the expected elements", async ({page}, testInfo) => {
    await goToPage(page);

    // Capture screenshot
    // await page.screenshot({ path: '/tmp/screenshots/' + testInfo.titlePath + '/homepage.png', fullPage: true });
    await expect(page.locator(getTestID("navbar-landing"))).not.toBeEmpty();
    await expect(page.locator(getTestID("navbar-sign-in-link"))).toBeVisible();
    await expect(page.locator(getTestID("logo"))).toBeVisible();
    await expect(page.locator(getText("phylogenetic analysis"))).toBeVisible();
    await expect(page.locator(getTestID("landing-footer"))).toBeVisible();
  });
});
