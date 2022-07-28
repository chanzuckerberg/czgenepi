/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {
        getByTestId<K extends keyof HTMLElementTagNameMap>(selector: string): Chainable<JQuery<HTMLElementTagNameMap[K]>>;
        getById<K extends keyof HTMLElementTagNameMap>(selector: string): Chainable<JQuery<HTMLElementTagNameMap[K]>>;
        findByTestId<K extends keyof HTMLElementTagNameMap>(selector: string): Chainable<JQuery<HTMLElementTagNameMap[K]>>;
        login<K extends keyof HTMLElementTagNameMap>(username: string, password: string): Chainable<JQuery<HTMLElementTagNameMap[K]>>;
    }
}