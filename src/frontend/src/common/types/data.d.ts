interface Transform {
  key: string;
  inputs: string[];
  method: (inputs: any[]) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface DataCategory {
  data: BioinformaticsDataArray | undefined;
  headerRenderer?: CustomRenderer;
  headers: Header[];
  isDataLoading: boolean;
  renderer?: CustomRenderer;
  subheaders: Record<string, Header[]>;
  text: string;
  to: string;
  transforms?: Transform[];
}
