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