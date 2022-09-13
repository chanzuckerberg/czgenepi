import { SampleData } from "./sampleData";
export type UploadData = {
  dataFile: string;
  metadataFile?: string;
  samples: Array<SampleData>;
};
