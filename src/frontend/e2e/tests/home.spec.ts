import { expect, test } from "@playwright/test";
import { getByTestID } from "../utils/selectors";
import path from "path";
import dotenv from 'dotenv';

dotenv.config({path: path.resolve(`.env.${process.env.NODE_ENV}`),});

const footer: Record<string, string> = {
  Github: "https://github.com/chanzuckerberg/czgenepi/",
  Careers:
    "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
  "Learning Center":
    "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
};

test.describe("Home page tests", () => {
  test("Should verify home page", async ({ page }) => {
    await page.goto(process.env.BASEURL as string);
    await expect(page.locator(getByTestID("navbar-landing"))).not.toBeEmpty();
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
