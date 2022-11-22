import { ROUTES } from "../routes";

interface Transform {
  key: string;
  inputs: string[];
  method: (inputs: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// TODO-TR (mlila): remove this type
interface DataCategory {
  count?: number;
  data: SampleMapType | TreeMapType;
  defaultSortKey: string[];
  headers: Header[];
  isDataLoading: boolean;
  renderer?: CustomRenderer;
  subheaders: Record<string, SubHeader[]>;
  text: VIEWNAME;
  to: ROUTES;
  transforms?: Transform[];
}
