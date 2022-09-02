import { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly signButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signButton = page.locator('a[data-test-id="navbar-sign-in-link"]');
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.continueButton = page.locator("main.login button[type='submit']");
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.goto("https://staging.czgenepi.org/");
    await this.signButton.click();
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);
    await this.continueButton.click();
    await this.page.waitForURL("https://staging.czgenepi.org/data/samples");
    return await this.page.click(
      "body #onetrust-banner-sdk #onetrust-accept-btn-handler"
    );
  }
}
