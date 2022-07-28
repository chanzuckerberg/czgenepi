/// <reference types="cypress" />

import './commands'
Cypress.on("uncaught:exception", () => {
    return false;
});

Cypress.on("before:browser:launch", (browser = {}, args) => {
    if(browser.name === "chrome"){
        args.push("--disable-site-isolation-trials");
    }
})

Cypress.on("window:before:load", (win) => {
    // @ts-ignore
    delete win.navigator.__proto__.ServiceWorker;
})