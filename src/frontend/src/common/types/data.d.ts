import { ROUTES } from "../routes";

// TODO-TR: move these types to the dorectories where they are used
interface Transform {
  key: string;
  inputs: string[];
  method: (inputs: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface TabData {
  count?: number;
  text: VIEWNAME;
  to: ROUTES;
}
