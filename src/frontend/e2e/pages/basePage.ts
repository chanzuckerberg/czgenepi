import { Page } from "@playwright/test";

/**
 * Base class with convenience wrappers for interactions
 * with page elements
 */
export abstract class BasePage {
  constructor(public readonly page: Page) {}

  /**
   * Convenience method to press the enter key
   */
  async pressEnter() {
    this.page.keyboard.press("Enter");
  }

  /**
   * Convenience method to press the escape key.
   */
  async pressEsc() {
    this.page.keyboard.press("Escape");
  }

  /**
   * Convenience method to rpess the tab key.
   */
  async pressTab() {
    this.page.keyboard.press("Tab");
  }

  protected async clickByText(value: string) {
    await this.page.click(`text=${value}`);
  }

  protected async clickById(value: string) {
    await this.page.click(`[id="${value}"]`);
  }

  protected async clickByTesId(value: string) {
    await this.page.click(`[data-test-id="${value}"]`);
  }

  protected async clickByName(value: string) {
    await this.page.click(`[name="${value}"]`);
  }

  protected async fillByPlaceHolder(placeholder: string, value: string) {
    await this.page.fill(`[placeholder="${placeholder}"]`, value);
  }

  protected async fillById(id: string, value: string) {
    await this.page.fill(`[id="${id}"]`, value);
  }

  protected async fillByName(name: string, value: string) {
    await this.page.fill(`[name="${name}"]`, value);
  }

  protected async fillTestId(testId: string, value: string) {
    await this.page.fill(`[data-test-id="${testId}"]`, value);
  }

  protected async findByLabel(label: string, value: string) {
    await this.page.fill(`[label="${label}"]`, value);
  }

  protected async findByName(name: string) {
    return this.page.locator(`[name="${name}"]`);
  }

  protected async findByText(text: string) {
    return this.page.locator(`text="${text}"`);
  }
  protected async findById(id: string) {
    return this.page.locator(`[id="${id}"]`);
  }
  protected async findByTestId(testId: string) {
    return this.page.locator(`[data-test-id="${testId}"]`);
  }

  protected async findClassName(className: string) {
    return this.page.locator(`css = ${className}`);
  }

  /**
   * Convenience method for this.page.keyboard.type.  Note that this requires
   * an already focused input to type into.  Normally via click or focus.
   * @param value The text to type on the keyboard
   */
  protected async typeText(value: string) {
    await this.page.keyboard.type(value);
  }
}
