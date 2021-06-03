import { getTestID, getText } from "tests/features/utils/selectors";
import { goToPage } from "./utils/helpers";

describe("Homepage", () => {
  it("renders the expected elements", async () => {
    await goToPage();

    await expect(page).toHaveSelector(getTestID("navbar"));
    await expect(page).toHaveSelector(getTestID("navbar-sign-in-link"));
    await expect(page).toHaveSelector(getTestID("logo"));
    await expect(page).toHaveSelector(getText("Welcome to Aspen!"));
    await expect(page).toHaveSelector(getTestID("footer"));
  });
});
