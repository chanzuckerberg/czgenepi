// import { expect, Page, test, TestInfo } from "@playwright/test";
// import { ROUTES } from "../../src/common/routes";
// import { describeIfDeployed, login, screenshot } from "./utils/helpers";
// import { getTestID, getText } from "./utils/selectors";
//
// // (thuang): Samples and Trees
// const TAB_COUNT = 2;
//
// // (thuang): `data-test-id` is generated at runtime via `row-${header.key}`
// const ROW_PUBLIC_ID = "row-publicId";
//
// test.describe("Data", () => {
//   test.describe("Samples Page", () => {
//     test("renders the basic elements", async ({
//       page,
//     }: { page: Page }, testInfo: TestInfo) => {
//       await setupSamplesPage(page, testInfo);
//
//       await expect(
//         page.locator(getTestID("header-row")).first()
//       ).not.toBeEmpty();
//       await expect(page.locator(getText("Private ID")).first()).not.toBeEmpty();
//       await expect(page.locator(getText("Public ID")).first()).not.toBeEmpty();
//       await expect(
//         page.locator(getText("Upload Date")).first()
//       ).not.toBeEmpty();
//       await expect(
//         page.locator(getText("Collection Date")).first()
//       ).not.toBeEmpty();
//       await expect(
//         page.locator(getText("Collection Location")).first()
//       ).not.toBeEmpty();
//       await expect(page.locator(getText("Lineage")).first()).not.toBeEmpty();
//       await expect(page.locator(getText("GISAID")).first()).not.toBeEmpty();
//
//       await expect(
//         page.locator(getTestID("table-row")).first()
//       ).not.toBeEmpty();
//       await expect(
//         page.locator(getTestID("sample-status")).first()
//       ).not.toBeEmpty();
//
//       await expect(page.locator(getTestID("data-menu-item"))).toHaveCount(
//         TAB_COUNT
//       );
//     });
//
//     test("search works", async ({
//       page,
//     }: { page: Page }, testInfo: TestInfo) => {
//       await setupSamplesPage(page, testInfo);
//
//       const searchBoxWrapper = page.locator(getTestID("search"));
//       const searchBox = searchBoxWrapper.locator("input");
//       // TODO - search queries are *inclusive* so if we have a row in a table called
//       // "foo" and another called "foo_bar" a search for "foo" will display both rows.
//       // This shortcut is dependent on the data in our setup script but we should
//       // probably iterate over all visible rows to make sure they contain the search
//       // string instead.
//       await searchBox?.fill("_failed");
//
//       const firstPublicIdElement = await page.$(getTestID(ROW_PUBLIC_ID));
//       const firstPublicId = await firstPublicIdElement?.textContent();
//
//       await searchBox?.fill(firstPublicId || "no id");
//
//       await screenshot(page, testInfo);
//       await expect(page.locator(getTestID("table-row"))).toHaveCount(1);
//     });
//
//     test("sorts by column header", async ({
//       page,
//     }: { page: Page }, testInfo: TestInfo) => {
//       await setupSamplesPage(page, testInfo);
//
//       const publicIds = await getAllPublicIds(page);
//
//       await page.locator(getTestID("header-cell")).first().click();
//
//       const sortedPublicIds = await getAllPublicIds(page);
//
//       expect(publicIds).not.toEqual(sortedPublicIds);
//     });
//   });
//
//   test.describe("Trees Page", () => {
//     test("renders the basic elements", async ({
//       page,
//     }: { page: Page }, testInfo: TestInfo) => {
//       await setupTreesPage(page, testInfo);
//     });
//
//     describeIfDeployed("Nextstrain link", () => {
//       test("generates the link", async ({
//         page,
//       }: { page: Page }, testInfo: TestInfo) => {
//         await setupTreesPage(page, testInfo);
//
//         await page.click(getTestID("tree-name-cell"));
//
//         expect(page.locator(getTestID("modal-content"))).toBeVisible();
//         expect(page.locator(getTestID("tree-link-button"))).toBeVisible();
//
//         const treeLink = await page.$(getTestID("tree-link"));
//
//         //expect(page).toHaveTextContent("Confirm");
//         expect(await treeLink?.getAttribute("href")).toBeTruthy();
//       });
//     });
//   });
// });
//
// async function setupSamplesPage(page: Page, testInfo: TestInfo) {
//   await login(page, testInfo);
//
//   await expect(page.locator(getTestID(ROW_PUBLIC_ID)).first()).not.toBeEmpty();
//
//   expect(page.url()).toContain(ROUTES.DATA_SAMPLES);
// }
//
// async function setupTreesPage(page: Page, testInfo: TestInfo) {
//   await login(page, testInfo);
//
//   await expect(page.locator(getTestID("data-menu-items"))).toBeVisible();
//
//   await page.locator(getText("Phylogenetic Trees")).click();
//
//   const COLUMN_COUNT = 4;
//
//   await expect(page.locator(getTestID("header-cell"))).toHaveCount(
//     COLUMN_COUNT
//   );
//
//   await expect(page.locator(getTestID("header-row"))).toBeVisible();
//   await expect(page.locator(getText("Tree Name"))).toBeVisible();
//   await expect(page.locator(getText("Creation Date"))).toBeVisible();
//
//   expect(page.url()).toContain(ROUTES.PHYLO_TREES);
// }
//
// async function getAllPublicIds(page: Page) {
//   const allPublicIdElements = await page.$$(getTestID(ROW_PUBLIC_ID));
//
//   return Promise.all(
//     allPublicIdElements.map(async (element) => await element.textContent())
//   );
// }
