import { test, expect } from '@playwright/test';
import {
  describeIfDeployed,
  login,
  tryUntil,
} from "./utils/helpers";
import { getTestID, getText } from "./utils/selectors";
import { ROUTES } from "../../src/common/routes";

// (thuang): Samples and Trees
const TAB_COUNT = 2;

// (thuang): `data-test-id` is generated at runtime via `row-${header.key}`
const ROW_PUBLIC_ID = "row-publicId";

test.describe("Data", () => {
  test.describe("Samples Page", () => {
    test("renders the basic elements", async ({page}, testInfo) => {
      await setupSamplesPage(page, testInfo);

      await expect(page.locator(getTestID("header-row")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Private ID")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Public ID")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Upload Date")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Collection Date")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Collection Location")).first()).not.toBeEmpty();
      await expect(page.locator(getText("Lineage")).first()).not.toBeEmpty();
      await expect(page.locator(getText("GISAID")).first()).not.toBeEmpty();

      await expect(page.locator(getTestID("table-row")).first()).not.toBeEmpty();
      await expect(page.locator(getTestID("sample-status")).first()).not.toBeEmpty();

      await expect(page.locator(
        getTestID("data-menu-item"))).toHaveCount(TAB_COUNT);
    });

    test("search works", async ({page}, testInfo) => {
      await setupSamplesPage(page, testInfo);

      const firstPublicIdElement = await page.$(getTestID(ROW_PUBLIC_ID));

      const firstPublicId = await firstPublicIdElement?.textContent();

      const searchBoxWrapper = page.locator(getTestID("search"));
      const searchBox = searchBoxWrapper.locator("input");
      await searchBox?.fill(firstPublicId || "no id");

      await expect(page.locator(getTestID("table-row"))).toHaveCount(1)
    });

    test("sorts by column header", async ({page}, testInfo) => {
      await setupSamplesPage(page, testInfo);

      const publicIds = await getAllPublicIds(page);

      await page.locator(getTestID("header-cell")).first().click();

      const sortedPublicIds = await getAllPublicIds(page);

      expect(publicIds).not.toEqual(sortedPublicIds);
    });
  });

  test.describe("Trees Page", () => {
    test("renders the basic elements", async ({page}, testInfo) => {
      await setupTreesPage(page, testInfo);
    });

    describeIfDeployed("Nextstrain link", () => {
      test("generates the link", async ({page}, testInfo) => {
        await setupTreesPage(page, testInfo);

        await page.click(getTestID("tree-name-cell"));

        expect(page.locator(getTestID("modal-content"))).toBeVisible();
        expect(page.locator(getTestID("tree-link-button"))).toBeVisible();

        const treeLink = await page.$(getTestID("tree-link"));

        expect(page).toHaveTextContent("Confirm");
        expect(await treeLink?.getAttribute("href")).toBeTruthy();
      });
    });
  });
});

async function setupSamplesPage(page, testInfo) {
  await login(page, testInfo);

  await expect(page.locator(getTestID(ROW_PUBLIC_ID)).first()).not.toBeEmpty();

  expect(page.url()).toContain(ROUTES.DATA_SAMPLES);
}

async function setupTreesPage(page, testInfo) {
  await login(page, testInfo);

  await expect(page.locator(getTestID("data-menu-items"))).toBeVisible();

  await page.locator(getText("Phylogenetic Trees")).click();

  const COLUMN_COUNT = 4;

  await expect(page.locator(getTestID("header-cell"))).toHaveCount(COLUMN_COUNT)

  await expect(page.locator(getTestID("header-row"))).toBeVisible();
  await expect(page.locator(getText("Tree Name"))).toBeVisible();
  await expect(page.locator(getText("Creation Date"))).toBeVisible();

  expect(page.url()).toContain(ROUTES.PHYLO_TREES);
}

async function getAllPublicIds(page) {
  const allPublicIdElements = await page.$$(getTestID(ROW_PUBLIC_ID));

  return Promise.all(
    allPublicIdElements.map(async (element) => await element.textContent())
  );
}
