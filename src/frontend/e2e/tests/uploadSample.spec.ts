import {test,expect} from '@playwright/test'
import {SamplesPage} from '../pages/SamplesPage'
import {UploadPage} from '../pages/UploadPage'
import {login} from '../utils/login';
import path from 'path';
import * as dotenv from 'dotenv' 
dotenv.config({path:path.join(__dirname,'../.env')});


test.describe("Filter Test Suite", () => {
  let samplePage: SamplesPage;
  let uploadPage: UploadPage;
  const testDataTxt = 'test_data.txt';
  const sampleVirus10 = 'hCoV-19/USA/CA-CCC_Ex10'
  const sampleNames = ['hCoV-19/USA/CA-CCC_Ex8','hCoV-19/USA/CA-CCC_Ex9',sampleVirus10];
    test.beforeEach(async ({ page })=>{
        samplePage = new SamplesPage(page);
        uploadPage = new UploadPage(page);
        await login(page,process.env.USERNAME as string,process.env.PASSWORD as string);
    })

    test('Should upload extension files',async ()=>{
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles(testDataTxt);
        await expect(uploadPage.importedFileNameList).toContainText(await uploadPage.getImportedFileNameList());
        await uploadPage.removeAllImportedFiles();
        await uploadPage.uploadSampleFiles('test_data.fasta');
        await expect(uploadPage.importedFileNameList).toContainText(await uploadPage.getImportedFileNameList());
        await uploadPage.removeAllImportedFiles();
        await uploadPage.uploadSampleFiles('test_data.fa');
        await expect(uploadPage.importedFileNameList).toContainText(await uploadPage.getImportedFileNameList());
        await uploadPage.removeAllImportedFiles();
    });

    test('Should fill form invalid data', async({page})=>{
        const invalidSamples=[
            {
                collectionDate: "   ",
                collectionLocation: "Africa/Angola/Luanda/Calemba",
                isPrivate: true,
                privateId: "my name",
                publicId: "juan camaney",
                sequencingDate:"    "
            },
            {
                collectionDate: "2022-08-lou",
                collectionLocation: "israel",
                isPrivate: true,
                privateId: "her name",
                publicId: "this is public",
                sequencingDate:"2022-04-768",
            },
            {
                collectionDate: "2022-02-04",
                collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
                isPrivate: true,
                privateId: "no more names here",
                publicId: "could be public ",
                sequencingDate:"2022-07-04",
                
            }
        ];
        
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles(testDataTxt);
        await uploadPage.clickContinue();
        for(let i = 0; i < 2; i++){
            await uploadPage.fillSampleInfo(sampleNames[i],invalidSamples[i]);
            await expect(await uploadPage.getCollectionDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
            await expect(await uploadPage.getsequencingDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
        }
        await uploadPage.fillSampleInfo(sampleNames[2],invalidSamples[2]);
        await expect(await page.locator(await uploadPage.collectionDateInvalidFormatMsg.replace('${VAR}',sampleVirus10)).isVisible()).toBe(false);
        await expect(await page.locator(await uploadPage.sequencingDateInvalidFormatMsg.replace('${VAR}',sampleVirus10)).isVisible()).toBe(false);
    });

    test('Should fill upload form ', async()=>{
        const validSamples = [
            {
                collectionDate: "2022-04-12",
                collectionLocation: "Africa/Angola/Luanda/Calemba",
                isPrivate: true,
                privateId: "random name",
                publicId: "juan camaney",
                sequencingDate:"2022-04-12",
            },
            {
                collectionDate: "2022-08-08",
                collectionLocation: "North America/Mexico",
                isPrivate: true,
                privateId: "another big name",
                publicId: "pedro paramo",
                sequencingDate:"2022-04-23",
                
            },
            {
                collectionDate: "2022-02-04",
                collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
                isPrivate: true,
                privateId: "the largest name ever",
                publicId: "john mclane",
                sequencingDate:"2022-07-04",
            }
        ]
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles(testDataTxt);
        await uploadPage.clickContinue();
        for (let index = 0; index < sampleNames.length; index++) {
            await uploadPage.fillSampleInfo(sampleNames[index],validSamples[index]);
        }
        await expect(await uploadPage.submitSamplesButton.isVisible()).toBe(true);
    });
});
