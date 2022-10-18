import { expect, test } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import { BasePage } from "../pages/basePage";
import { HOME_PAGE } from "../utils/constants";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

test.describe("Home page tests", () => {
  // overwrite global login with empty storage so we can visit home page
  test.use({ storageState: "e2e/storage/emptyStorageState.json" });
  test("Should verify home page", async ({ page }) => {
    const base = new BasePage(page);
    //now go to home page
    await base.gotoUrl(`${process.env.BASEURL}`);

    await base.waitForSelector("text=No-code phylogenetic analysis");

    // verify navigation menu
    await expect(await base.findByTestId("navbar-landing")).toBeVisible();

    await expect(await base.findByTestId("navbar-sign-in-link")).toBeVisible();

    // verify logo
    await expect(await base.findByTestId("logo")).toBeVisible();

    // verify footer links
    Object.keys(HOME_PAGE.FOOTER).forEach(async (key) => {
      await expect((await base.findLinkByText(key)).nth(0)).toHaveAttribute(
        "href",
        HOME_PAGE.FOOTER[key as keyof typeof HOME_PAGE.FOOTER] as string
      );
    });
  });
});
