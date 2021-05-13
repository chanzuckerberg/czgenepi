import { createMuiTheme } from "@material-ui/core/styles";
import { defaultAppTheme, makeThemeOptions } from "czifui";

const primaryColors = {
  "100": "#FCFAFF",
  "200": "#F6F2FC",
  "300": "#D4BFFF",
  "400": "#511CC1",
  "500": "#4317A1",
  "600": "#371680",
};

const infoColors = {
  "100": "#F6F2FC",
  "200": "#F3EDFC",
  "400": "#511CC1",
  "600": "#371680",
};

const appTheme = { ...defaultAppTheme };

appTheme.colors.primary = primaryColors;
appTheme.colors.info = infoColors;

export const theme = createMuiTheme(makeThemeOptions(appTheme));
