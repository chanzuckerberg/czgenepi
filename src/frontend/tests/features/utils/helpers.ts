import ENV from "src/common/constants/ENV";
import nodeEnv from "src/common/constants/nodeEnv";
import { getTestID, getText } from "./selectors";

export const TIMEOUT_MS = 30 * 1000;

export async function goToPage(
  url: string = ENV.FRONTEND_URL as string
): Promise<void> {
  await page.goto(url);
}

export async function login(): Promise<void> {
  expect(ENV.E2E_USERNAME).toBeDefined();

  goToPage();

  try {
    await expect(page).toHaveSelector(getTestID("nav-user-menu"), {
      timeout: TIMEOUT_MS,
    });
  } catch (error) {
    await page.click(getText("Sign in"));

    await page.fill('[name="Username"], [name="username"]', ENV.E2E_USERNAME);
    await page.fill('[name="Password"], [name="password"]', ENV.E2E_PASSWORD);

    await Promise.all([
      page.waitForNavigation(),
      page.click('[value="login"], [type="submit"]'),
    ]);

  }
}

export async function tryUntil(
  assert: () => void,
  maxRetry = 50
): Promise<void> {
  const WAIT_FOR_MS = 200;

  let retry = 0;

  let savedError: Error = new Error();

  while (retry < maxRetry) {
    try {
      await assert();

      break;
    } catch (error) {
      if (error instanceof Error) {
        retry += 1;
        savedError = error;
        await page.waitForTimeout(WAIT_FOR_MS);
      }
    }
  }

  if (retry === maxRetry) {
    savedError.message += " tryUntil() failed";
    throw savedError;
  }
}

export const describeIfDeployed = [
  nodeEnv.PRODUCTION,
  nodeEnv.STAGING,
].includes(ENV.DEPLOYMENT_STAGE)
  ? describe
  : describe.skip;
