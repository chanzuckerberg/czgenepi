import {test,expect} from '@playwright/test'
import {TreeInfo} from '../utils/schemas/treeInfo'
import {LoginPage} from '../page-objects/LoginPage'
import {SamplesPage} from '../page-objects/SamplesPage'
import {UploadPage} from '../page-objects/UploadPage'
import {PhylogeneticTreePage} from '../page-objects/PhylogeneticTreePage'

test.describe('Phylogenetic Tree', ()=>{
    let loginPage: LoginPage;
    let samplePage: SamplesPage;
    let uploadPage: UploadPage;
    let treesPage: PhylogeneticTreePage;

    test.beforeEach(async ({page})=>{
        loginPage = new LoginPage(page);
        samplePage = new SamplesPage(page);
        uploadPage = new UploadPage(page);
        treesPage = new PhylogeneticTreePage(page);
        await loginPage.login('lbrambila@contractor.chanzuckerberg.com','Br@mb1la');
    });

    test("tree test",async ()=>{
        const tree: TreeInfo = {
            treeName: "juan",
            treeType: "juan",
            lineage: "any",
            collectionDate: "any",
            forceIncludedSamples: "any"
        }
        await samplePage.openNextstrainPhylogeneticTreeModal()
        await treesPage.createTree(tree);
 
     })
 

});