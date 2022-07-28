/// <reference types="cypress" />

import { BASEURL } from "./constants";

export interface Credentials {
  username: string;
  password: string;
}
export default abstract class AuthUtil {
  public static login(username: string, password: string) {
    cy.visit(`${BASEURL}`);

    // click Sign in button
    cy.getByTestId('navbar-sign-in-link').should('be.visible').click()
    
    // enter credentials and submit
    cy.getById("username").type(username);
    cy.getById("password").type(password);
    cy.get('button[type="submit"]').wait(1000).should("be.enabled").click();

    // assert successful login
    cy.url().should('include', '/data/samples');

  }
}