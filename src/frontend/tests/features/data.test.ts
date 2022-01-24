import {
  describeIfDeployed,
  login,
  tryUntil,
} from "tests/features/utils/helpers";
import { getTestID, getText } from "tests/features/utils/selectors";
import { ROUTES } from "../../src/common/routes";

// (thuang): Samples and Trees
const TAB_COUNT = 2;

// (thuang): `data-test-id` is generated at runtime via `row-${header.key}`
const ROW_PUBLIC_ID = "row-publicId";

describe("Data", () => {
  describe("Samples Page", () => {
    test("renders the basic elements", async () => {
      await setupSamplesPage();

      await expect(page).toHaveSelector(getTestID("header-row"));
      await expect(page).toHaveSelector(getText("Private ID"));
      await expect(page).toHaveSelector(getText("Public ID"));
      await expect(page).toHaveSelector(getText("Upload Date"));
      await expect(page).toHaveSelector(getText("Collection Date"));
      await expect(page).toHaveSelector(getText("Collection Location"));
      await expect(page).toHaveSelector(getText("Lineage"));
      await expect(page).toHaveSelector(getText("GISAID"));

      await expect(page).toHaveSelector(getTestID("table-row"));
      await expect(page).toHaveSelector(getTestID("sample-status"));

      await expect(page).toHaveSelectorCount(
        getTestID("data-menu-item"),
        TAB_COUNT
      );
    });

    test("search works", async () => {
      await setupSamplesPage();

      const firstPublicIdElement = await page.$(getTestID(ROW_PUBLIC_ID));

      const firstPublicId = await firstPublicIdElement?.textContent();

      const searchBoxWrapper = await page.$(getTestID("search"));

      if (!searchBoxWrapper) {
        throw Error("search box not found!");
      }

      const searchBox = await searchBoxWrapper.$("input");

      await searchBox?.fill(firstPublicId || "no id");

      await tryUntil(() =>
        expect(page).toHaveSelectorCount(getTestID("table-row"), 1)
      );
    });

    test("sorts by column header", async () => {
      await setupSamplesPage();

      const publicIds = await getAllPublicIds();

      await page.click(getTestID("header-cell"));

      const sortedPublicIds = await getAllPublicIds();

      expect(publicIds).not.toEqual(sortedPublicIds);
    });
  });

  describe("Trees Page", () => {
    test("renders the basic elements", async () => {
      await setupTreesPage();
    });

    describeIfDeployed("Nextstrain link", () => {
      test("generates the link", async () => {
        await setupTreesPage();

        await page.click(getTestID("tree-name-cell"));

        expect(page).toHaveSelector(getTestID("modal-content"));
        expect(page).toHaveSelector(getTestID("tree-link-button"));

        const treeLink = await page.$(getTestID("tree-link"));

        expect(page).toHaveTextContent("Confirm");
        expect(await treeLink?.getAttribute("href")).toBeTruthy();
      });
    });
  });
});

async function setupSamplesPage() {
  await login();

  await expect(page).toHaveSelector(getTestID("loading-cell"));
  await expect(page).toHaveSelector(getTestID(ROW_PUBLIC_ID));

  expect(page.url()).toContain(ROUTES.DATA_SAMPLES);
}

async function setupTreesPage() {
  await login();

  await expect(page).toHaveSelector(getTestID("data-menu-items"));

  await page.click(getText("Phylogenetic Trees"));

  const COLUMN_COUNT = 4;

  await tryUntil(() =>
    expect(page).toHaveSelectorCount(getTestID("header-cell"), COLUMN_COUNT)
  );

  await expect(page).toHaveSelector(getTestID("header-row"));
  await expect(page).toHaveSelector(getText("Tree Name"));
  await expect(page).toHaveSelector(getText("Creation Date"));

  expect(page.url()).toContain(ROUTES.PHYLO_TREES);
}

async function getAllPublicIds() {
  const allPublicIdElements = await page.$$(getTestID(ROW_PUBLIC_ID));

  return Promise.all(
    allPublicIdElements.map(async (element) => await element.textContent())
  );
}
