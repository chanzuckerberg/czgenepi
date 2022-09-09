import { test, expect } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";
import { PhylogeneticTree } from "../pages/phylogeneticTree";
import { MockData } from "../utils/mockData";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

test.describe("Phylogenetic Tree tests", () => {
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
  });

  test("Should create Overview tree type", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeType: "Overview",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate tree created successfully
  });

  test("Should create Targeted tree type", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeType: "Targeted",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate tree created successfully
  });

  test("Should create Non-Contextualized tree type", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeType: "Non_Contextualized",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate tree created successfully
  });
  test("Should create tree with forced samples", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeType: "Overview",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate tree created successfully
  });
  test("Should reject invalid Force-include samples", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      forceIncludedSamples: ["1234567890", "0987654321"],
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate error message
    expect(
      page.locator("span", {
        hasText: "couldn’t be found and will not appear on your tree.",
      })
    ).toBeTruthy;
  });
  test("Should limit tree name character length", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeName:
        "Bacon ipsum dolor amet kevin burgdoggen sirloin, shoulder shankle chislic ham. Salami capicola fatback chislic alcatra strip steak jerky boudin doner shoulder pork loin ball tip. Shank prosciutto pork",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate error message
    expect(
      page.locator("span", { hasText: "Name exceeds the 128 character limit." })
    ).toBeTruthy;
  });

  test("Should reject missing tree name", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeName: "",
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate error message
    expect(page.locator("span", { hasText: "Your tree requires a Tree Name." }))
      .toBeTruthy;
  });

  test("Should reject missing tree type", async ({ page }) => {
    const treeInfo: TreeInfo = MockData.generateTreeData("period", {
      treeType: undefined,
    });

    //create tree
    await PhylogeneticTree.fillTreeInfo(page, treeInfo);
    // validate error message
    expect(
      page.locator("span", { hasText: "Please select a Tree Type to proceed." })
    ).toBeTruthy;
  });

  test(`Should reject invalid collection dates`, async () => {
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
