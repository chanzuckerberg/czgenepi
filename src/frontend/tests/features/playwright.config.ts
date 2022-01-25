import { PlaywrightTestConfig } from '@playwright/test';
const config: PlaywrightTestConfig = {
    timeout: 60000,
    use: {
	ignoreHTTPSErrors: true,
    },
};
export default config;
