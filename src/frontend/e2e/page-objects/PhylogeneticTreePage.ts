import {Locator, Page} from '@playwright/test'
import {TreeInfo} from '../utils/schemas/treeInfo'

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
        readonly radiosTreeType: Locator

    constructor(page: Page){
        this.page = page
        this.treeNameInput = page.locator("#outlined-basic");
        this.overviewRatioButton = page.locator("input[value='OVERVIEW']");
        this.targetedRatioButton = page.locator("input[value='TARGETED']");
        this.nonContextualizedRatioButton = page.locator("input[value='NON_CONTEXTUALIZED']");
        this.lineageDropDown = page.locator("p + button[label='All']");
        this.collectionDateDropDown = page.locator("p + button[label='All Time']");
        this.forcedIncludeTextArea = page.locator("//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::textarea[not(@aria-hidden='true')]");
        this.addForcedSamplesButton = page.locator("//button[text()='Add']");
        this.createTreeButton = page.locator("//span[text()='Create Tree']");
        this.radiosTreeType = page.locator("span[class*='Radio'] > input");
    }

    async createTree(treeInfo: TreeInfo){
        await this.treeNameInput.type(treeInfo.treeName);
        const types = await this.radiosTreeType.evaluateAll(radios => radios.map( element =>  element.getAttribute('value')))
        for(let i = 0; i < types.length; i++){
            if(treeInfo.treeType.toUpperCase() === types[i]){
               await this.page.locator('//span[text()="${VAR} "]'.replace('${VAR}',treeInfo.treeType)).click();
            }
        }
        //console.log("ESTOS SON LOS RATIOS "+types);
         if(typeof Array.isArray(await treeInfo.lineage)){
          await this.lineageDropDown.click();
            for(let j = 0; j < treeInfo.lineage.length; j++){
                await this.page.locator("//div[@role='tooltip']/descendant::input").type(treeInfo.lineage[j]);
                let lineageOption = "//div[@role='menuitem']/descendant::div[text()='${VAR}']".replace('${VAR}',treeInfo.lineage[j]);
                await this.page.locator(lineageOption).click();
                await this.page.locator("//div[@role='tooltip']/descendant::input").click();
                while(await this.page.locator("//div[@role='tooltip']/descendant::input").getAttribute("value") !== ''){
                    await this.page.keyboard.press('Backspace');
                    await this.page.keyboard.press('Delete');
                }
            }
            await this.page.keyboard.press('Escape');
         }
        if(typeof await treeInfo.collectionDate === 'string'){
            await this.collectionDateDropDown.click();
            await this.page.locator("//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::span[text()='${VAR}']".replace('${VAR}',treeInfo.collectionDate)).click();
        }
        else if(typeof Array.isArray(await treeInfo.collectionDate)){
            await this.collectionDateDropDown.click();
            await this.page.locator("//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[1]").type(treeInfo.collectionDate[0]);
            await this.page.locator("//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[2]").type(treeInfo.collectionDate[1]);
            await this.page.locator("//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::button").click();
        }
        if (typeof treeInfo.forceIncludedSamples === 'string'){
            await this.forcedIncludeTextArea.type(treeInfo.forceIncludedSamples);
            await this.addForcedSamplesButton.click();
        } 
       // await this.createTreeButton.click();
    }

}
