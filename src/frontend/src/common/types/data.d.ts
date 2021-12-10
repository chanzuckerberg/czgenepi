interface Transform {
  key: string;
  inputs: string[];
  method: (inputs: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface DataCategory {
  data: SampleMapType | TreeMapType;
  defaultSortKey: string[];
  headers: Header[];
  isDataLoading: boolean;
  renderer?: CustomRenderer;
  subheaders: Record<string, SubHeader[]>;
  text: VIEWNAME;
  to: string;
  transforms?: Transform[];
}
