interface Transform {
  key: string;
  inputs: string[];
  method: (inputs: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface DataCategory {
  data: BioinformaticsDataArray | undefined;
  defaultSortKey: string[];
  headerRenderer?: CustomRenderer;
  headers: Header[];
  isDataLoading: boolean;
  renderer?: CustomRenderer;
  subheaders: Record<string, SubHeader[]>;
  text: string;
  to: string;
  transforms?: Transform[];
}
