import 'cypress-wait-until';

describe("Sample page tests", () => {
    const username = Cypress.env("username");
    const password = Cypress.env("password");

    const headers = [
        'Private ID',
        'Public ID',
        'Collection Date',
        'Lineage',
        'Upload Date',
        'Collection Location',
        'Sequencing Date',
        'GISAID'
    ]

    const sampleDataWithIds: Record<string, string> = {
        "row-publicId": "hCoV-19/USA/ADMIN-18181/2022",
        "row-collectionDate": "2022-07-10",
        "row-collectionLocation": "San Mateo County",
        "row-sequencingDate": "2022-07-12"
    };

    const sampleDataWithIndex: Record<number, string> = {
        3: "20SCPH11281",
        10: "A",
        11: "2022-07-18",
        17: "Not Found"
    };
 
    // before(() =>{
    //     cy.login(username, password);
    // })
    beforeEach(() => {
        cy.login(username, password);
        cy.visit('/data/sample')
    })

    it("Should verify list header", () => {
        cy.getByTestId('header-row').find('[data-test-id="header-cell"]').each((item, index) => {
            cy.wrap(item).invoke('text').should('be.eq', headers[index]);
        });
    })

    it("Should verify there is a least one record", () => {
        cy.getByTestId('table-row').its('length').should('be.gte', 1);
    })

    it("Should verify sample data", () => {
        // wait utnil data is fully rendered and ids resolved
        cy.waitUntil(() => 
            cy.getByTestId('row-publicId').should('exist'),
            {interval: 500, timeout: 90000}
        ).then(() => {

        // verify sample attributes that have test ids
            cy.getByTestId('table-row').first().then((firsSample) => {
                Object.keys(sampleDataWithIds).forEach((testId) => {
                    cy.get(`[data-test-id="${testId}"]`, {withinSubject: firsSample})
                    .invoke('text').should('be.eq', sampleDataWithIds[testId])
                });

            });

            // verify sample attributes that have no test ids
            cy.getByTestId('table-row').first().then((firsSample) => {
                Object.keys(sampleDataWithIndex).forEach((index) => {
                    const idx = Number(index)
                    cy.get('div', {withinSubject: firsSample})
                    .eq(idx)
                    .invoke('text').should('include', sampleDataWithIndex[idx])
                });
            });
        });
    })
})