import { expect, Locator, Page } from "@playwright/test";

const collectionDateLocator = "button[label='Collection Date']";
const collectionDateStartLocator = "input[name='collectionDateStart']";

export class SamplesPage {
  readonly page: Page;
  readonly genomeRecoveryDropDown: Locator;
  readonly genomeRecoveryOptions: string;
  readonly sampleStatusesList: Locator;
  readonly lineageDropDown: Locator;
  readonly lineageInput: Locator;
  readonly availableLineages: string;
  readonly optionFromAnyfilterSelected: Locator;
  readonly lineageList: Locator;
  readonly collectionDateDropDown: Locator;
  readonly uploadButton: Locator;
  readonly treeButton: Locator;
  readonly nextStrainPhylogeneticTreeOption: Locator;
  readonly treeNameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.genomeRecoveryDropDown = page.locator(
      "button[label='Genome Recovery']"
    );
    this.genomeRecoveryOptions = "div[role='tooltip'] li span.primary-text";
    this.sampleStatusesList = page.locator("div[data-test-id='sample-status']");
    this.lineageDropDown = page.locator("button[label='Lineage']");
    this.lineageInput = page.locator("div[data-test-id='sample-status']");
    this.availableLineages = "ul[role='listbox']  .primary-text > div";
    this.optionFromAnyfilterSelected = page.locator("div > .MuiChip-deletable");
    this.lineageList = page.locator(
      "div[data-test-id='table-row'] > div:nth-of-type(4) > div"
    );
    this.collectionDateDropDown = page.locator(collectionDateLocator);
    this.uploadButton = page.locator("a[href$='/upload/1'] > button");
    this.treeButton = page.locator('div[status="info"] + div + div + span');
    this.nextStrainPhylogeneticTreeOption = page.locator(
      "//span[text()='Nextstrain Phylogenetic Tree']"
    );
    this.treeNameInput = page.locator("#outlined-basic");
  }

  async navigateToUpload() {
    await this.uploadButton.click();
    await this.page.waitForURL("https://staging.czgenepi.org/upload/1");
  }

  async filterByGenomeRecoveryStatus(option: string) {
    await this.page.waitForURL("https://staging.czgenepi.org/data/samples");
    await this.genomeRecoveryDropDown.click();
    await this.page
      .locator(this.genomeRecoveryOptions, { hasText: `${option}` })
      .click();
  }

  async getSampleStatusList(): Promise<string[]> {
    const statuses = this.sampleStatusesList;
    const arrayStatus: string[] = [];
    const count = await statuses.count();
    for (let i = 0; i < count; ++i) {
      arrayStatus.push((await statuses.nth(i).textContent()) as string);
    }
    return arrayStatus;
  }

  async filterLineage(lineages: string[]) {
    let actualLineage = 0;
    await this.lineageDropDown.click();
    while (actualLineage < lineages.length) {
      await this.page
        .locator(this.availableLineages, { hasText: lineages[actualLineage] })
        .first()
        .click();
      actualLineage++;
    }
    await this.page.keyboard.press("Escape");
  }

  async getLineageList(): Promise<string[]> {
    const lineages = this.lineageList;
    const arrayStatus: string[] = [];
    const count = await lineages.count();
    for (let i = 0; i < count; ++i) {
      arrayStatus.push((await lineages.nth(i).textContent()) as string);
    }
    return arrayStatus;
  }

  async clickOnTreeButton() {
    this.treeButton.click();
  }

  async openNextstrainPhylogeneticTreeModal() {
    await this.clickOnTreeButton();
    await this.nextStrainPhylogeneticTreeOption.click();
  }
}

// export async function filterGenomeRecovery(option: string, page: Page): Promise<void>{
//     await page.waitForURL("https://staging.czgenepi.org/data/samples");
//     await page.waitForTimeout(1000);
//     await page.click("button[label='Genome Recovery']");
//     await page.locator("div[role='tooltip'] li span.primary-text",{hasText:`${option}`}).click();
//   }

//   export async function getSampleStatuses(page: Page,desireStatus: string): Promise<void>{
//    const statuses = await page.$$eval("div[data-test-id='sample-status']",
//    list => list.map(element => element.textContent));
//    let counter = 0;
//    for(let i = 0; i < statuses.length; i++ ){
//         if(statuses[i] == desireStatus){
//           counter++
//         }
//    }
//    await expect(statuses).toHaveLength(counter);
//    console.log("CURRENT STATUSES FILTERED: "+ statuses);
//   }

//   export async function filterLineage(page: Page,lineages: string[]){
//     let actualLineage = 0;
//     while(actualLineage < lineages.length){
//       await page.click("button[label='Lineage']");
//       await page.type("div[data-test-id='sample-status']",lineages[actualLineage]);
//       await page.click("ul[role='listbox'] > li:first-of-type");
//       await page.keyboard.press('Escape');
//       const filterOn = await page.locator('div > .MuiChip-deletable');
//       await expect(filterOn).toHaveText(lineages[actualLineage]);
//       const filteredLineages = await page.$$eval("div[data-test-id='table-row'] > div:nth-of-type(4) > div",
//       list => list.map(element => element.textContent));
//       let counter = 0;
//       for(let i = 0; i < filteredLineages.length; i++ ){
//          if(filteredLineages[i] == lineages[actualLineage]){
//            counter++
//          }
//       }
//      await expect(filteredLineages).toHaveLength(counter);
//      console.log("CURRENT STATUSES FILTERED: "+ filteredLineages);
//      await page.click('svg.MuiChip-deleteIcon');
//      actualLineage++;
//     }
//   }

export async function filterCollectionDate(page: Page, filterDate: string) {
  await page.click(collectionDateLocator);
  const periods = await page.locator("div[style*='194'] span > span");
  periods.filter({ hasText: filterDate }).click();
  const filterOn = await page.locator("div > .MuiChip-deletable");
  await expect(filterOn).toHaveText(filterDate);
  await page.waitForTimeout(2000);
}

export async function filterCustomCollectionDate(
  page: Page,
  initialDate: string,
  endDate: string
) {
  await page.click(collectionDateLocator);
  await page.type(collectionDateStartLocator, initialDate);
  await page.type(collectionDateStartLocator, endDate);
}

export async function getCollectionDate(page: Page): Promise<any[]> {
  await page.waitForSelector("div[data-test-id*='collectionDate']");
  await page.waitForTimeout(2000);
  return await page.$$eval("div[data-test-id*='collectionDate']", (list) =>
    list.map((element) => element.textContent)
  );
}
/*
Method takes filter by date as unit and value and then converts into date object
*/
export function getFilterDate(unit: string, value: number): Date {
  let today = new Date();
  let filterDate = new Date(today);
  if (unit === "d") {
    filterDate.setDate(filterDate.getDay() - value);
  } else if (unit === "m") {
    filterDate.setMonth(filterDate.getMonth() - value);
  } else if (unit === "y") {
    filterDate.setFullYear(filterDate.getFullYear() - value);
  } else if (unit === "yesterday") {
    filterDate.setDate(filterDate.getDay() - 1);
  }
  return filterDate;
}

/*
Method collection or sequence date is within filtering criteria
*/
export function validateCollectionOrSequenceDate(
  subjectDate: Date,
  fromDate: Date,
  toDate?: Date
): boolean {
  let result = false;
  if (subjectDate.getTime() <= fromDate.getTime()) {
    result = true;
  }
  if (toDate !== undefined && subjectDate.getTime() > toDate.getTime()) {
    result = false;
  }
  return result;
}

/*
  timeLapse = 7d,30d, 3m, 6m, 1y
  * */
export async function measureDateTimes(page: Page, timeLapse: string) {
  const today = new Date();
  const collectionDates = await getCollectionDate(page);
  const totalTime = parseInt(timeLapse.match(/[0-9]+/)?.toString()!);
  const timeframe = timeLapse.split(/[0-9]+/)[1];
  const timesOkFlags = [];

  for (let i = 0; i < collectionDates.length; i++) {
    switch (timeframe) {
      case "d":
        const day = today.getDate();
        const sampleDate = parseInt(collectionDates[i].split("-")[2]);
        const dayDifference: number = day - sampleDate;
        if (dayDifference <= totalTime) {
          timesOkFlags.push(true);
        } else {
          timesOkFlags.push(false);
        }
        break;

      case "m":
        const monthlySample = new Date(
          collectionDates[i].split("-")[0],
          parseInt(collectionDates[i].split("-")[1]),
          collectionDates[i].split("-")[2]
        );
        //new Date(2022,9,11)
        const monthlyDiff = Math.abs(
          new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          ).getTime() - monthlySample.getTime()
        );
        const days = Math.ceil(monthlyDiff / (1000 * 3600 * 24));

        if (days <= totalTime * 30) {
          timesOkFlags.push(true);
        } else {
          timesOkFlags.push(false);
        }
        break;

      case "y":
        const samDate = new Date(
          collectionDates[i].split("-")[0],
          collectionDates[i].split("-")[1],
          collectionDates[i].split("-")[2]
        );
        const diff = Math.abs(
          new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate()
          ).getTime() - samDate.getTime()
        );
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        if (diffDays <= 366 * totalTime) {
          timesOkFlags.push(true);
        } else {
          timesOkFlags.push(false);
        }
        break;
      default:
        break;
    }
  }
}
