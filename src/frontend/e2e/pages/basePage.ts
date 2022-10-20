import { ElementHandle, Locator, Page } from "@playwright/test";
import * as path from "path";
import { ACCEPTCOOKIES } from "../utils/constants";

type ElPromiseType = Promise<ElementHandle<SVGElement | HTMLElement> | null>;

/**
 * Base class with convenience wrappers for interactions
 * with page elements
 */
export class BasePage {
  constructor(public readonly page: Page) {}

  async acceptCookies(): Promise<void> {
    //accept site cookies if prompted
    if (await this.page.isVisible(ACCEPTCOOKIES)) {
      await this.page.locator(ACCEPTCOOKIES).click();
    }
  }

  async gotoUrl(url: string, option?: any): Promise<void> {
    if (option) {
      await this.page.goto(url, option);
    } else {
      await this.page.goto(url);
    }
  }
  /**
   * Convenience method to press the enter key
   */
  async pressEnter(): Promise<void> {
    this.page.keyboard.press("Enter");
  }

  /**
   * Convenience method to press the escape key.
   */
  async pressEsc(): Promise<void> {
    this.page.keyboard.press("Escape");
  }

  /**
   * Convenience method to press key.
   */
  async pressKey(key: string): Promise<void> {
    this.page.keyboard.press(key, { delay: 100 });
  }
  /**
   * Convenience method to press the tab key.
   */
  async pressTab(): Promise<void> {
    this.page.keyboard.press("Tab");
  }

  async clickElement(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Convenience method to click by text
   * @param value text value
   */
  async clickByText(value: string): Promise<void> {
    await this.page.click(`text=${value}`);
  }

  /**
   * Convenience method to click by id. not to be confused with data-testid or data-test-id
   * @param value id attribute of an element
   */
  async clickById(value: string): Promise<void> {
    await this.page.click(`[id="${value}"]`);
  }

  /**
   * Convenience method to click by data-test-id
   * @param value test ids added specifically for testing
   */
  async clickByTestId(value: string): Promise<void> {
    await this.page.click(`[data-test-id="${value}"]`);
  }

  async clickCheckBox(index: number): Promise<void> {
    await this.page.locator('input[type="checkbox"]').nth(index).click();
  }

  /**
   * Convenince method to click by name
   * @param value name attribute of the element
   */
  async clickByName(value: string): Promise<void> {
    await this.page.click(`[name="${value}"]`);
  }

  async clickByTypeName(type: string, name: string): Promise<void> {
    await this.page.click(`${type}[name="${name}"]`);
  }

  async clickByTypeAndLabel(type: string, label: string): Promise<void> {
    await this.page.click(`${type}[label="${label}"]`);
  }

  async fillByPlaceHolder(placeholder: string, value: string): Promise<void> {
    await this.page.fill(`[placeholder="${placeholder}"]`, value);
  }

  async fillById(id: string, value: string): Promise<void> {
    await this.page.fill(`[id="${id}"]`, value);
  }

  async fillByName(name: string, value: string): Promise<void> {
    await this.page.fill(`[name="${name}"]`, value);
  }
  async fillByTypeAndName(
    type: string,
    name: string,
    value: string
  ): Promise<void> {
    await this.page.fill(`${type}[name="${name}"]`, value);
  }
  async fillByTypeAndLabel(
    type: string,
    name: string,
    value: string
  ): Promise<void> {
    await this.page.fill(`${type}[label="${name}"]`, value);
  }
  async fillTestId(testId: string, value: string): Promise<void> {
    await this.page.fill(`[data-test-id="${testId}"]`, value);
  }
  async fillByText(text: string, value: string): Promise<void> {
    await this.page.fill(`text=${text}`, value);
  }

  async findElement(selector: string): Promise<Locator> {
    return this.page.locator(`${selector}`);
  }
  async findByLabel(label: string): Promise<Locator> {
    return this.page.locator(`[label="${label}"]`);
  }
  async findByTypeAndLabel(type: string, label: string): Promise<Locator> {
    return this.page.locator(`${type}[label="${label}"]`);
  }
  async findByTypeAndName(type: string, name: string): Promise<Locator> {
    return this.page.locator(`${type}[label="${name}"]`);
  }

  async findByName(name: string): Promise<Locator> {
    return this.page.locator(`[name="${name}"]`);
  }

  async findByText(text: string): Promise<Locator> {
    return this.page.locator(`text="${text}"`);
  }
  async findLinkByText(text: string): Promise<Locator> {
    return this.page.locator(`a:has-text("${text}")`);
  }
  async findById(id: string): Promise<Locator> {
    return this.page.locator(`[id="${id}"]`);
  }
  async findByTestId(testId: string): Promise<Locator> {
    return this.page.locator(`[data-test-id="${testId}"]`);
  }

  async findClassName(className: string): Promise<Locator> {
    return this.page.locator(`css = ${className}`);
  }

  async findByPlaceHolder(placeholder: string): Promise<Locator> {
    return this.page.locator(`[placeholder="${placeholder}"]`);
  }

  async findByInputName(name: string): Promise<Locator> {
    return this.page.locator(`input[name="${name}"]`);
  }

  async waitForSelector(selector: string, waitTime = 120000): ElPromiseType {
    return this.page.waitForSelector(selector, { timeout: waitTime });
  }

  async waitForTimeout(timeout: number): Promise<void> {
    return this.page.waitForTimeout(timeout);
  }

  async selectFile(filePath: string): Promise<void> {
    this.page.setInputFiles("input[type='file']", path.resolve(filePath));
    await this.page.waitForTimeout(3000);
  }

  async queryElement(selector: string): ElPromiseType {
    return this.page.$(selector);
  }
  /**
   * Convenience method for this.page.keyboard.type.  Note that this requires
   * an already focused input to type into.  Normally via click or focus.
   * @param value The text to type on the keyboard
   */
  async typeText(value: string): Promise<void> {
    await this.page.keyboard.type(value);
  }
}
