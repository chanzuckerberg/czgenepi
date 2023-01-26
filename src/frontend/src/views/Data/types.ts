import { VIEWNAME } from "src/common/constants/types";
import { ROUTES } from "src/common/routes";

export interface TabData {
  count?: number;
  text: VIEWNAME;
  to: ROUTES;
}
