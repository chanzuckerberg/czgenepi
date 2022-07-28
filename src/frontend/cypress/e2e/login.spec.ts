import  AuthUtil  from '../utility/auth'

describe("Login tests", () => {
    const username = Cypress.env("username");
    const password = Cypress.env("password");

    it("Should login with valid credentials", () => {
        cy.login(username, password);
    })
})