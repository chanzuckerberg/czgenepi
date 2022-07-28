# playwright
## installation
Run `npm i` to install the Playwright from the package.json.

## running tests
To run Playwright tests you will need to specify the config file. We have created NPM scripts to make like a bit easier:

`npm run pl:staging:headed` - runs playwright tests againg staging environment in headed browser
`npm run pl:staging:headless` - sanme as above but headless
`npm run pl:staging:debug` - runs Playwright in debug mode
`npm run pl:report` opens test results report in the browser

NOTES: 
You need to be in the `src/frontend` to run these tests


# cypress
## installation
Run `npm i` to install the Cypress from the package.json.

## running tests
To run Cypress tests you will need to specify the config file. We have created NPM scripts to make like a bit easier:

`npm run cy:staging:open` - runs Cypress tests in UI runner and browser. You will be able to follow the progress and results of the test in the Cypress UI and the target application in the browser
`npm run cy:staging:run` - this will run Cypress tests in the terminal without the UI and browser. The results will be printed in the Mocha format.

NOTES: 
You need to be in the `src/frontend` to run these tests

