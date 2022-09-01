import {test,expect} from '@playwright/test'
import {SampleData} from '../utils/schemas/sampleData'
import {LoginPage} from '../pages/LoginPage'
import {SamplesPage} from '../pages/SamplesPage'
import {UploadPage} from '../pages/UploadPage'
import {login} from '../utils/login';
import path from 'path';
import * as dotenv from 'dotenv' 
dotenv.config({path:path.join(__dirname,'../.env')});


test.describe("Filter Test Suite",()=>{
    let loginPage: LoginPage;
    let samplePage: SamplesPage;
    let uploadPage: UploadPage;

    test.beforeEach(async ({ page })=>{
        loginPage = new LoginPage(page);
        samplePage = new SamplesPage(page);
        uploadPage = new UploadPage(page);
        await login(page,process.env.USERNAME,process.env.PWD);
    })

    test('Should upload extension files',async ()=>{
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles('test_data.txt');
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
        const samples: SampleData[] =[
            {
                privateId: "my name",
                publicId: "juan camaney",
                collectionDate: "   ",
                collectionLocation: "Africa/Angola/Luanda/Calemba",
                sequencingDate:"    ",
                isPrivate: true
            },
            {
                privateId: "her name",
                publicId: "this is public",
                collectionDate: "2022-08-lou",
                collectionLocation: "israel",
                sequencingDate:"2022-04-768",
                isPrivate: true
            },
            {
                privateId: "no more names here",
                publicId: "could be public ",
                collectionDate: "2022-02-04",
                collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
                sequencingDate:"2022-07-04",
                isPrivate: true
            }
        ];
        const sampleNames = ['hCoV-19/USA/CA-CCC_Ex8','hCoV-19/USA/CA-CCC_Ex9','hCoV-19/USA/CA-CCC_Ex10']
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles('test_data.txt');
        await uploadPage.clickContinue();
        for(let i = 0; i < 2; i++){
            await uploadPage.fillSampleInfo(sampleNames[i],samples[i]);
            await expect(await uploadPage.getCollectionDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
            await expect(await uploadPage.getsequencingDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
        }
        await uploadPage.fillSampleInfo(sampleNames[2],samples[2]);
        await expect(await page.locator(await uploadPage.collectionDateInvalidFormatMsg.replace('${VAR}','hCoV-19/USA/CA-CCC_Ex10')).isVisible()).toBe(false);
        await expect(await page.locator(await uploadPage.sequencingDateInvalidFormatMsg.replace('${VAR}','hCoV-19/USA/CA-CCC_Ex10')).isVisible()).toBe(false);
    });

    test('Should fill upload form ', async()=>{
        const sampleNames = ['hCoV-19/USA/CA-CCC_Ex9','hCoV-19/USA/CA-CCC_Ex8','hCoV-19/USA/CA-CCC_Ex10'];
        const samples = [
            {
                privateId: "random name",
                publicId: "juan camaney",
                collectionDate: "2022-04-12",
                collectionLocation: "Africa/Angola/Luanda/Calemba",
                sequencingDate:"2022-04-12",
                isPrivate: true
            },
            {
                privateId: "another big name",
                publicId: "pedro paramo",
                collectionDate: "2022-08-08",
                collectionLocation: "North America/Mexico",
                sequencingDate:"2022-04-23",
                isPrivate: true
            },
            {
                privateId: "the largest name ever",
                publicId: "john mclane",
                collectionDate: "2022-02-04",
                collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
                sequencingDate:"2022-07-04",
                isPrivate: true
            }
        ]
        await samplePage.navigateToUpload();
        await uploadPage.uploadSampleFiles('test_data.txt');
        await uploadPage.clickContinue();
        for (let index = 0; index < sampleNames.length; index++) {
            await uploadPage.fillSampleInfo(sampleNames[index],samples[index]);
        }
        await expect(await uploadPage.submitSamplesButton.isVisible()).toBe(true);
    });

});
