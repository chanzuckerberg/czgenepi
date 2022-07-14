import { chromium, browser } from '@playwright/test';
import login from '../utils/login';

const email = process.env.EMAIL ?? 'dummy_email';
const password = process.env.PASSWORD ?? 'dummy_password';

async function globalSetup(config: FullConfig): Promise<void> {
    const { storageState } = config.projects[0].use;
    const browser = await chromium.launch();

    const page = await browser.newPage();
    await login(page, email, password);
    await page.context().storageState({
        path: storageState,
    });
}
export default globalSetup;