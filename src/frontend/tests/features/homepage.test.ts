import { expect, test } from "@playwright/test";
import { goToPage } from "./utils/helpers";
import { getTestID, getText } from "./utils/selectors";

test.describe("Homepage", () => {
  test("renders the expected elements", async ({ page }) => {
    await goToPage(page);

    await expect(page.locator(getTestID("navbar-landing"))).not.toBeEmpty();
    await expect(page.locator(getTestID("navbar-sign-in-link"))).toBeVisible();
    await expect(page.locator(getTestID("logo"))).toBeVisible();
    await expect(page.locator(getText("phylogenetic analysis"))).toBeVisible();
    await expect(page.locator(getTestID("landing-footer"))).toBeVisible();
  });
});
