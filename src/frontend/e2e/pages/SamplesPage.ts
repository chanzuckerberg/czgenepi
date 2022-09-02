import {Locator, Page} from '@playwright/test'

export class SamplesPage {

    readonly page: Page
    readonly genomeRecoveryDropDown: Locator
    readonly genomeRecoveryOptions: string
    readonly sampleStatusesList: Locator
    readonly lineageDropDown: Locator
    readonly lineageInput: Locator
    readonly availableLineages: string
    readonly optionFromAnyfilterSelected: Locator
    readonly lineageList: Locator
    readonly collectionDateDropDown: Locator
    readonly uploadButton: Locator
    readonly treeButton: Locator
    readonly nextStrainPhylogeneticTreeOption: Locator
    readonly treeNameInput: Locator
    readonly collectionDateList: Locator

    constructor(page: Page){
        this.page = page
        this.genomeRecoveryDropDown = page.locator("button[label='Genome Recovery']");
        this.genomeRecoveryOptions = "div[role='tooltip'] li span.primary-text";
        this.sampleStatusesList = page.locator("div[data-test-id='sample-status']");
        this.lineageDropDown = page.locator("button[label='Lineage']");
        this.lineageInput = page.locator("div[data-test-id='sample-status']");
        this.availableLineages = "ul[role='listbox']  .primary-text > div";
        this.optionFromAnyfilterSelected = page.locator("div > .MuiChip-deletable");
        this.lineageList = page.locator("div[data-test-id='table-row'] > div:nth-of-type(4) > div");
        this.collectionDateDropDown = page.locator("button[label='Collection Date']");
        this.uploadButton = page.locator("a[href='/upload/step1']");
        this.treeButton = page.locator('div[status="info"] + div + div + span');
        this.nextStrainPhylogeneticTreeOption = page.locator("//span[text()='Nextstrain Phylogenetic Tree']");
        this.treeNameInput = page.locator("#outlined-basic");
        this.collectionDateList = page.locator("div[data-test-id*='collectionDate']");
    }

    async navigateToUpload(){
     await this.uploadButton.click();
     await this.page.waitForURL('https://staging.czgenepi.org/upload/step1/groupId/74/pathogen/covid');
    }

    async filterGenomeRecovery(option: string){
        await this.page.waitForURL("https://staging.czgenepi.org/data/samples/groupId/74/pathogen/covid");
        await this.genomeRecoveryDropDown.click();
        await this.page.locator(this.genomeRecoveryOptions,{hasText:`${option}`}).click();
    }

    async getSampleStatusList(): Promise<(string)[]>{
        const statuses = this.sampleStatusesList;
        const arrayStatus: string[] = [];
        const count = await statuses.count()
        for (let i = 0; i < count; ++i){
           arrayStatus.push( await statuses.nth(i).textContent() as string);
        }
        return arrayStatus;
    }

    async filterLineage(lineages: string[]){
        let actualLineage = 0;
        await this.lineageDropDown.click();
        while(actualLineage < lineages.length){
            await this.page.locator(this.availableLineages,{ hasText: lineages[actualLineage] }).first().click();
            actualLineage++;
        }
        await this.page.keyboard.press('Escape');
    }

    async getLineageList(): Promise<(string)[]>{
        const lineages = this.lineageList;
        const arrayStatus: string[] = [];
        const count = await lineages.count()
        for (let i = 0; i < count; ++i){
           arrayStatus.push( await lineages.nth(i).textContent() as string);
        }
        return arrayStatus;
    }

    async clickOnTreeButton(){
      this.treeButton.click();
    }

    async openNextstrainPhylogeneticTreeModal(){
      await this.clickOnTreeButton();
      await this.nextStrainPhylogeneticTreeOption.click();
    }

    async filterCollectionDate(filterDate:string){
      await this.collectionDateDropDown.click();
     // const periods =  await this.page.locator("div[style*='194'] span > span");
     // periods.filter({ hasText: filterDate }).click();
     this.page.locator("div[style*='194'] span > span").filter({ hasText: filterDate }).click();
      await this.page.waitForTimeout(2000);
   }

    async  filterCustomCollectionDate(initialDate:string,endDate:string){
    await this.page.click("button[label='Collection Date']");
    await this.page.type("input[name='collectionDateStart']",initialDate);
    await this.page.type("input[name='collectionDateStart']",endDate);
    await this.page.locator("//ul[@role='menu']/descendant::button[text()='Apply']").click();
  }
   
    async getCollectionDate(): Promise<any[]>{
    await this.page.waitForTimeout(2000);
    return this.collectionDateList.allTextContents();
  }

    /*
    this function takes a string, named timelapse with an specific value
    [timeLapse = 7d,30d, 3m, 6m, 1y] each value corresponds to a timeframe to be validated 
    against the list of samples that are being filtered within samples page, 
    i.e (if a select Last 30 Days as a filter, then i need to invoke this function with 30d as argument
    in order the corresponding validation occurs)
    * */
   
    async measureDateTimes(timeLapse: string): Promise<boolean>{
    const today = new Date();
    const collectionDates = await this.getCollectionDate();
    const totalTime  = parseInt(timeLapse.match(/[0-9]+/)?.toString() as string);
    const timeframe = timeLapse.split(/[0-9]+/)[1];
    const timesOkFlags = [];

    for(let i = 0; i < collectionDates.length; i++){
      switch(timeframe){
        case 'd':
          if(today.getDate() - parseInt(collectionDates[i].split('-')[2]) <= totalTime){
            timesOkFlags.push(true);
          }else{
            timesOkFlags.push(false);
          }
          break;

        case 'm':
         if((Math.abs(new Date(today.getFullYear(),(today.getMonth()+1),today.getDate()).getTime() - new Date(collectionDates[i].split('-')[0],(parseInt(collectionDates[i].split('-')[1])),collectionDates[i].split('-')[2]).getTime() ) <= (totalTime*30))){
            timesOkFlags.push(true);
          }else{
            timesOkFlags.push(false);
          }
          break;

        case 'y':
            if((Math.abs(new Date(today.getFullYear(),(today.getMonth()+1),today.getDate()).getTime() - new Date(collectionDates[i].split('-')[0],collectionDates[i].split('-')[1],collectionDates[i].split('-')[2]).getTime()) <= (366*totalTime))){
              timesOkFlags.push(true);
            }else{
              timesOkFlags.push(false);
            }
            break;
         default:
          break;
      }
    }
    return timesOkFlags.some(validDate =>{validDate === false});
  }
}

