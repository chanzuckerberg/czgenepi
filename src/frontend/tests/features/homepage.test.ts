import { test, expect } from '@playwright/test';
import { getTestID, getText } from "./utils/selectors";
import { goToPage } from "./utils/helpers";

test.describe("Homepage", () => {
  test("renders the expected elements", async ({page}) => {
    await goToPage(page);

    expect(page.locator(getTestID("navbar-landing"))).toBeVisible();
    expect(page.locator(getTestID("navbar-sign-in-link"))).toBeVisible();
    expect(page.locator(getTestID("logo"))).toBeVisible();
    expect(page.locator(getText("phylogenetic analysis"))).toBeVisible();
    expect(page.locator(getTestID("landing-footer"))).toBeVisible();
  });
});
