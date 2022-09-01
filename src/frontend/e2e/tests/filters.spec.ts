import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { SamplesPage } from "../pages/SamplesPage";

test.describe("Sample filtering tests", () => {
  let loginPage: LoginPage;
  let samplePage: SamplesPage;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    loginPage = new LoginPage(page);
    samplePage = new SamplesPage(page);
    //await loginPage.login();
  });

  test("Should filter by Complete Genome Recovery status", async () => {
    await samplePage.filterByGenomeRecoveryStatus("Complete");
    const statusList = await samplePage.getSampleStatusList();
    await expect(samplePage.sampleStatusesList).toHaveText(statusList);
  });

  test("Should filter by Lineage", async ({ page }) => {
    await samplePage.filterLineage(["BA.1.1", "BA.1.15"]);
    const lineageList = await samplePage.getLineageList();
    await expect(samplePage.lineageList).toContainText(lineageList);
  });

  test.skip("Should filter by Collection date", async ({ page }) => {
    // await filterCollectionDate(page,'Last 7 Days');
    //   await measureDateTimes(page,'7d');
    //   await filterCollectionDate(page,'Last 30 Days');
    //   await measureDateTimes(page,'30d');
    //   await filterCollectionDate(page,'Last 3 Months');
    //   await measureDateTimes(page,'3m');
    //   await filterCollectionDate(page,'Last 6 Months');
    //   await measureDateTimes(page,'6m');
    //   await filterCollectionDate(page,'Last Year');
    //   await measureDateTimes(page,'1y');
  });
});
