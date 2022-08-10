import {test,expect} from '@playwright/test'
import {filterGenomeRecovery,getSampleStatuses,filterLineage} from '../utils/archive/helpers'


test.describe("Filter Test Suite",()=>{
    test.beforeEach(async ({ page })=>{
        await page.goto('https://staging.czgenepi.org/');     
        await page.click('a[data-test-id="navbar-sign-in-link"]');
        await page.type('#username','lbrambila@contractor.chanzuckerberg.com');
        await page.type('#password','Br@mb1la');
        await page.click("main.login button[type='submit']");
        await expect(page).toHaveURL('https://staging.czgenepi.org/data/samples');
        await page.waitForURL("https://staging.czgenepi.org/data/samples");
        await page.waitForTimeout(1000);
    })

    test("Genome Recovery filter by [complete] test",async ({ page })=>{
        await filterGenomeRecovery('Complete',page);
        const filterOn = await page.locator('div > .MuiChip-deletable');
        await expect(filterOn).toHaveText('Complete');
        await getSampleStatuses(page,'complete');
    })
    
    test.skip("Genome Recovery filter by [failed] test",async ({ page })=>{
        await expect(page).toHaveURL('https://staging.czgenepi.org/data/samples');
        await filterGenomeRecovery('failed',page);
        const filterOn = await page.locator('div > .MuiChip-deletable');
        await expect(filterOn).toHaveText('failed');
        await getSampleStatuses(page,'failed');
    })
    
    test("Lineage filter test",async ({ page })=>{
        await filterLineage(page,['BA.1.1','BA.1.15']);
    })    
});
    
        


