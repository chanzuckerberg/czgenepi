import {test,expect} from '@playwright/test'
import {SamplesPage} from '../pages/SamplesPage'
import {login} from '../utils/login'
import path from 'path'
import * as dotenv from 'dotenv'
dotenv.config({path:path.join(__dirname,'../.env')});


test.describe("Sample filtering tests", () => {
  let samplePage: SamplesPage;

    test.beforeEach(async ({ page })=>{
        samplePage = new SamplesPage(page);
        await login(page,process.env.USERNAME as string,process.env.PASSWORD as string);
    })

    test("Should Genome Recovery filter by completion",async ()=>{
       await samplePage.filterGenomeRecovery('Complete');
       const statusList = await samplePage.getSampleStatusList();
       await expect(samplePage.sampleStatusesList).toHaveText(statusList);

    })

    test("Should Genome Recovery filter option by failure",async ()=>{
        await samplePage.filterGenomeRecovery('failed');
        const statusList = await samplePage.getSampleStatusList();
        await expect(samplePage.sampleStatusesList).toHaveText(statusList);
    })

    test("Should filter Lineage",async ()=>{
         await samplePage.filterLineage(['BA.1.1','BA.1.15']);
         const lineageList = await samplePage.getLineageList();
         await expect(samplePage.lineageList).toContainText(lineageList);
    })

    test("Should Collection date filter", async()=>{
       await samplePage.filterCollectionDate('Last 7 Days');
       expect(!await samplePage.measureDateTimes('7d')).toBe(true);
       await samplePage.filterCollectionDate('Last 30 Days');
       expect(!await samplePage.measureDateTimes('30d')).toBe(true);
       await samplePage.filterCollectionDate('Last 3 Months');
       expect(!await samplePage.measureDateTimes('3m')).toBe(true);
       await samplePage.filterCollectionDate('Last 6 Months');
       expect(!await samplePage.measureDateTimes('6m')).toBe(true);
       await samplePage.filterCollectionDate('Last Year');
       expect(!await samplePage.measureDateTimes('1y')).toBe(true);
    })
});
