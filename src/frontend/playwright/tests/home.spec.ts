import { expect, test , Page} from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";

const footer: Record<string, string> = {
    "Github": "https://github.com/chanzuckerberg/czgenepi/",
    "Careers":  "https://chanzuckerberg.com/careers/career-opportunities/?initiative=science",
    "Learning Center":  "https://help.czgenepi.org/hc/en-us/categories/6217716150804-Genomic-Epidemiology-Learning-Center",
    //"Privacy":  "/privacy",
    //"Terms":  "/terms",
    //"Contact Us":  "mailto:hello@czgenepi.org"
}

test.describe("Home page tests", () => {
  test('Should verify home page', async ({ page }) => {
    await page.goto('https://staging.czgenepi.org');
    await expect(page.locator(getByTestID("navbar-landing"))).not.toBeEmpty();
    await expect(page.locator(getByTestID("navbar-sign-in-link"))).toBeVisible();
    await expect(page.locator(getByTestID("logo"))).toBeVisible();
    Object.keys(footer).forEach((key) => {
      expect(page.locator(`a:has-text("${key}")`).first()).toHaveAttribute("href", footer[key]);
    })
  });
});