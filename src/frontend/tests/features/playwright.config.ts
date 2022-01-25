import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
    use: {
	ignoreHTTPSErrors: true,
    },
};
export default config;
