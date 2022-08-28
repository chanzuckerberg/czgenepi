import { test, expect } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";
import { LoginPage } from "../page-objects/LoginPage";
import { SamplesPage } from "../page-objects/SamplesPage";
import { PhylogeneticTreePage } from "../page-objects/PhylogeneticTreePage";

test.describe("Phylogenetic Tree", () => {
  let loginPage: LoginPage;
  let samplePage: SamplesPage;
  let treesPage: PhylogeneticTreePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    samplePage = new SamplesPage(page);
    treesPage = new PhylogeneticTreePage(page);
    //await loginPage.login();
  });

  test("Tree name limit character amount test", async () => {
    const tree: TreeInfo = {
      treeName:
        "Bacon ipsum dolor amet kevin burgdoggen sirloin, shoulder shankle chislic ham. Salami capicola fatback chislic alcatra strip steak jerky boudin doner shoulder pork loin ball tip. Shank prosciutto pork",
      treeType: "Overview",
      lineage: ["A.15", "A.2.4", "A.19"],
      collectionDate: "Last 7 Days",
      forceIncludedSamples: "usdfasdfalsdjf",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    await expect(await treesPage.getExceedNumberCharactersErrorMsg()).toBe(
      "Name exceeds the 128 character limit."
    );
  });

  test("Tree name missing test", async () => {
    const tree: TreeInfo = {
      treeName: "",
      treeType: "Overview",
      lineage: ["A.15", "A.2.4", "A.19"],
      collectionDate: "Last 7 Days",
      forceIncludedSamples: "usdfasdfalsdjf",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getToolTipErrorMsg()).toBe(
      "Your tree requires a Tree Name."
    );
  });

  test("Tree type missing test", async () => {
    const tree: TreeInfo = {
      treeName: "Randon name",
      treeType: "",
      lineage: null,
      collectionDate: null,
      forceIncludedSamples:
        "MAYA-private_identifier_10,MAYA-private_identifier_11,MAYA-private_identifier_41,MAYA-private_identifier_5,MAYA-private_identifier_2",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getToolTipErrorMsg()).toBe(
      "Please select a Tree Type to proceed."
    );
  });

  test("Incorrect Force-include test", async () => {
    const tree: TreeInfo = {
      treeName: "",
      treeType: "Overview",
      lineage: ["AE.1", "AA.2", "A.17"],
      collectionDate: "Last 6 Months",
      forceIncludedSamples:
        "MAYA-private_identifier_10,MAYA-private_identifier_11,MAYA-private_identifier_41,MAYA-private_identifier_5,MAYA-private_identifier_2",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getSampleWarningMsg()).toBe(
      "1 Sample ID couldn’t be found and will not appear on your tree."
    );
  });

  test("Tree type: Overview test", async ({ page }) => {
    const tree: TreeInfo = {
      treeName: "This is an overview Type tree",
      treeType: "Overview",
      lineage: ["A.2"],
      collectionDate: ["2021-02-20", "2021-03-20"],
      forceIncludedSamples: "",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    await treesPage.createTreeButton.highlight();
    await page.waitForTimeout(2000);
  });

  test("Tree type: Targeted test", async ({ page }) => {
    const tree: TreeInfo = {
      treeName: "This is an Targeted Type tree",
      treeType: "targeted",
      lineage: null,
      collectionDate: null,
      forceIncludedSamples: "",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    await treesPage.createTreeButton.highlight();
    await page.waitForTimeout(2000);
  });

  test("Tree type: Non-Contextualized test", async ({ page }) => {
    const tree: TreeInfo = {
      treeName: "This is an Non-Contextualized Type tree",
      treeType: "Non_Contextualized",
      lineage: null,
      collectionDate: null,
      forceIncludedSamples: "",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    await treesPage.createTreeButton.highlight();
    await page.waitForTimeout(2000);
  });
});
