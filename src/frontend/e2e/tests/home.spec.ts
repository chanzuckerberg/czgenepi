import { expect, test } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import { BasePage } from "../pages/basePage";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

const footer: Record<string, string> = {
  Github: "https://github.com/chanzuckerberg/czgenepi/",
  Careers:
    "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
  "Learning Center":
    "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
};

test.describe("Home page tests", () => {
  test("Should verify home page", async ({ page }) => {
    const base = new BasePage(page);
    await base.goto(`${process.env.BASEURL}`);

    // lets logout so we get to visit home page
    await base.clickByTestId("nav-user-menu");

    //create element handle to prevent Logout link becoming detached
    const logoutElement = await base.queryElement("text=Logout");
    await logoutElement.click();

    //now go to home page
    await base.goto(`${process.env.BASEURL}`);

    await base.waitForSelector("text=No-code phylogenetic analysis");

    // verify navigation menu
    await expect(await base.findByTestId("navbar-landing")).toBeVisible();

    await expect(await base.findByTestId("navbar-sign-in-link")).toBeVisible();

    // verify logo
    await expect(await base.findByTestId("logo")).toBeVisible();

    // verify footer links
    Object.keys(footer).forEach(async (key) => {
      await expect(
        await (await base.findLinkByText(key)).nth(0)
      ).toHaveAttribute("href", footer[key]);
    });
  });
});
