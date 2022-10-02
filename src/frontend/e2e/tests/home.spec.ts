import { expect, test } from "@playwright/test";
import { getByTestID } from "../utils/selectors";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

const footer: Record<string, string> = {
  Github: "https://github.com/chanzuckerberg/czgenepi/",
  Careers:
    "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
  "Learning Center":
    "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
};

test.describe("Home page tests", () => {
  //reset storagestate; otherwise you won't see home page but samples page
  test.use({ storageState: undefined });

  test("Should verify home page", async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    await page.goto(`${baseURL}` as string);

    //wait until page content id displayed; in local this takes long time
    await page.waitForSelector(`text=No-code phylogenetic analysis`);

    // verify navigation menu
    await expect(page.locator(getByTestID("navbar-landing"))).toBeVisible();
    await expect(
      page.locator(getByTestID("navbar-sign-in-link"))
    ).toBeVisible();

    // verify logo
    await expect(page.locator(getByTestID("logo"))).toBeVisible();

    // verify footer links
    Object.keys(footer).forEach(async (key) => {
      await expect(
        await page.locator(`a:has-text("${key}")`).first()
      ).toHaveAttribute("href", footer[key]);
    });
  });
});
