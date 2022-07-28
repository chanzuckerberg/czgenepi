/// <reference path="../types/index.d.ts" />
import { BASEURL } from "../utility/constants";

Cypress.Commands.add("getByTestId", (selector: string) => {
    return cy.get(`[data-test-id="${selector}"]`)
})

Cypress.Commands.add("getById", (selector: string) => {
    return cy.get(`[id="${selector}"]`)
});

Cypress.Commands.add("findByTestId", (selector: string) => {
    return cy.findByTestId(`[data-test-id="${selector}"]`)
});

Cypress.Commands.add('login', (username: string, password: string) => {
    cy.visit(`${BASEURL}`);

    // click Sign in button
    cy.getByTestId('navbar-sign-in-link').should('exist').and('be.visible').click({force: true})
    
    // enter credentials and submit
    cy.getById("username").type(username);
    cy.getById("password").type(password);
    cy.get('button[type="submit"]').wait(1000).should("be.enabled").click();

    // assert successful login
    cy.url().should('include', '/data/samples');
    
});