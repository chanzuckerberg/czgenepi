import { test, expect } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";
import { PhylogeneticTree } from "../pages/phylogenetic-tree";
import { login } from "../utils/login";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

test.describe("Phylogenetic Tree tests", () => {
  test.beforeEach(async ({ page }) => {
    await login(
      page,
      process.env.USERNAME as string,
      process.env.PASSWORD as string
    );
  });

  test("Should create Overview tree type", async () => {
    const treeInfo: TreeInfo = {
      collectionDate: ["2021-02-20", "2021-03-20"],
      forceIncludedSamples: "",
      lineage: ["A.2"],
      treeName: "This is an overview Type tree",
      treeType: "Overview",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
  });

  test("Should create Targeted tree type", async () => {
    const tree: TreeInfo = {
      collectionDate: null,
      forceIncludedSamples: "",
      lineage: null,
      treeName: "This is an Targeted Type tree",
      treeType: "targeted",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
  });

  test("Should create Non-Contextualized tree type", async () => {
    const tree: TreeInfo = {
      collectionDate: null,
      forceIncludedSamples: "",
      lineage: null,
      treeName: "This is an Non-Contextualized Type tree",
      treeType: "Non_Contextualized",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
  });
  test("Should create tree with forced samples", async () => {
    const tree: TreeInfo = {
      collectionDate: null,
      forceIncludedSamples: "",
      lineage: null,
      treeName: "This is an Non-Contextualized Type tree",
      treeType: "Non_Contextualized",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
  });
  test("Should reject invalid Force-include samples", async () => {
    const tree: TreeInfo = {
      collectionDate: "Last 6 Months",
      forceIncludedSamples:
        "MAYA-private_identifier_10,MAYA-private_identifier_11,MAYA-private_identifier_41,MAYA-private_identifier_5,MAYA-private_identifier_2",
      lineage: ["AE.1", "AA.2", "A.17"],
      treeName: "",
      treeType: "Overview",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getSampleWarningMsg()).toBe(
      "1 Sample ID couldn’t be found and will not appear on your tree."
    );
  });
  test("Should limit tree name character length", async () => {
    const tree: TreeInfo = {
      collectionDate: "Last 7 Days",
      forceIncludedSamples: "usdfasdfalsdjf",
      lineage: ["A.15", "A.2.4", "A.19"],
      treeName:
        "Bacon ipsum dolor amet kevin burgdoggen sirloin, shoulder shankle chislic ham. Salami capicola fatback chislic alcatra strip steak jerky boudin doner shoulder pork loin ball tip. Shank prosciutto pork",
      treeType: "Overview",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    await expect(await treesPage.getExceedNumberCharactersErrorMsg()).toBe(
      "Name exceeds the 128 character limit."
    );
  });

  test("Should reject missing tree name", async () => {
    const tree: TreeInfo = {
      collectionDate: "Last 7 Days",
      forceIncludedSamples: "usdfasdfalsdjf",
      lineage: ["A.15", "A.2.4", "A.19"],
      treeName: "",
      treeType: "Overview",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getToolTipErrorMsg()).toBe(
      "Your tree requires a Tree Name."
    );
  });

  test("Should reject missing tree type", async () => {
    const tree: TreeInfo = {
      collectionDate: null,
      forceIncludedSamples:
        "MAYA-private_identifier_10,MAYA-private_identifier_11,MAYA-private_identifier_41,MAYA-private_identifier_5,MAYA-private_identifier_2",
      lineage: null,
      treeName: "Randon name",
      treeType: "",
    };
    await samplePage.openNextstrainPhylogeneticTreeModal();
    await treesPage.fillTreeInfo(tree);
    expect(await treesPage.getToolTipErrorMsg()).toBe(
      "Please select a Tree Type to proceed."
    );
  });

  test(`Should reject invalidate collection dates`, async () => {
    let samples = UploadSample.getSampleData();
    //overwrite equencing dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].sequencingDate = " ";
    }
    const uploadData = {
      applyToAll: true,
      dataFiles: ["sampleData.txt"],
      sample: samples,
    };
    await UploadSample.uploadFiles(page, uploadData, false, true);
    const errors = page.locator(
      "input[@name='sequencingDate']/../following-sibling::p"
    );
    for (let i = 0; i < samples.length; i++) {
      expect(errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });
});
