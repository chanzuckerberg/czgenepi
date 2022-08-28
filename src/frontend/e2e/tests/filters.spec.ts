import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { SamplesPage } from "../page-objects/SamplesPage";

test.describe("Filter Test Suite", () => {
  let loginPage: LoginPage;
  let samplePage: SamplesPage;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1200 });
    loginPage = new LoginPage(page);
    samplePage = new SamplesPage(page);
    //await loginPage.login();
  });

  test("Genome Recovery filter by [complete] test", async () => {
    await samplePage.filterGenomeRecovery("Complete");
    const statusList = await samplePage.getSampleStatusList();
    await expect(samplePage.sampleStatusesList).toHaveText(statusList);
  });

  test.skip("Genome Recovery filter by [failed] test", async () => {
    await samplePage.filterGenomeRecovery("failed");
    const statusList = await samplePage.getSampleStatusList();
    await expect(samplePage.sampleStatusesList).toHaveText(statusList);
  });

  test("Lineage filter test", async ({ page }) => {
    await samplePage.filterLineage(["BA.1.1", "BA.1.15"]);
    const lineageList = await samplePage.getLineageList();
    await expect(samplePage.lineageList).toContainText(lineageList);
  });

  // test("Collection date filter  test", async({ page })=>{
  //     await filterCollectionDate(page,'Last 7 Days');
  //     await measureDateTimes(page,'7d');
  //     await filterCollectionDate(page,'Last 30 Days');
  //     await measureDateTimes(page,'30d');
  //     await filterCollectionDate(page,'Last 3 Months');
  //     await measureDateTimes(page,'3m');
  //     await filterCollectionDate(page,'Last 6 Months');
  //     await measureDateTimes(page,'6m');
  //     await filterCollectionDate(page,'Last Year');
  //     await measureDateTimes(page,'1y');
  // })
});
