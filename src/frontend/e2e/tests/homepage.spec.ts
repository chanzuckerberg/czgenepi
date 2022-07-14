import { expect, test , Page} from "@playwright/test";
import { goToPage } from "../utils/helpers";
import { getTestID, getText } from "../utils/selectors";

test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('https://staging.czgenepi.org');
});

test.describe("Home page tests", () => {
  test('Should verify logo', async ({ page }) => {
    await expect(page.locator(getTestID("logo"))).toBeVisible();
  });
//   test("renders the expected elements", async ({ page }) => {
//     await goToPage(page);
//
//     await expect(page.locator(getTestID("navbar-landing"))).not.toBeEmpty();
//     await expect(page.locator(getTestID("navbar-sign-in-link"))).toBeVisible();
//     await expect(page.locator(getTestID("logo"))).toBeVisible();
//     await expect(page.locator(getText("phylogenetic analysis"))).toBeVisible();
//     await expect(page.locator(getTestID("landing-footer"))).toBeVisible();
//   });
});
