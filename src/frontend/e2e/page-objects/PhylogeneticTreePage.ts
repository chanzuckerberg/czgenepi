import {expect, Locator, Page} from '@playwright/test'

export class PhylogeneticTreePage {

    readonly page: Page
   
        readonly treeNameInput: Locator
        readonly overviewRatioButton: Locator
        readonly targetedRatioButton: Locator
        readonly nonContextualizedRatioButton: Locator
        readonly lineageDropDown: Locator
        readonly collectionDateDropDown: Locator
        readonly forcedIncludeTextArea: Locator
        readonly addForcedSamplesButton: Locator
        readonly createTreeButton: Locator

    constructor(page: Page){
        this.page = page
        this.treeNameInput = page.locator("#outlined-basic");
        this.overviewRatioButton = page.locator("input[value='OVERVIEW']");
        this.targetedRatioButton = page.locator("input[value='TARGETED']");
        this.nonContextualizedRatioButton = page.locator("input[value='NON_CONTEXTUALIZED']");
        this.lineageDropDown = page.locator("p + button[label='All']");
        this.collectionDateDropDown = page.locator("p + button[label='All Time']");
        this.forcedIncludeTextArea = page.locator("textarea");
        this.addForcedSamplesButton = page.locator("button[type='button'][class*='MuiButton-containedPrimary'] > span");
        this.createTreeButton = page.locator("//span[text()='Create Tree']");
    }



}
