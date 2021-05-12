interface BioinformaticsType {
  [index: string]: JSONPrimitive;
  type: "BioinformaticsType";
}

interface GISAID {
  status: "submitted" | "not_eligible" | "accepted" | "rejected" | "no_info";
  gisaid_id?: string;
}

interface Lineage {
  last_updated: unknown;
  lineage: unknown;
  probability: unknown;
  version: unknown;
}

interface Sample extends BioinformaticsType {
  type: "Sample";
  privateId: string;
  publicId: string;
  uploadDate: string;
  collectionDate: string;
  collectionLocation: string;
  gisaid: GISAID;
  CZBFailedGenomeRecovery: boolean;
  lineage: Lineage;
}

interface Tree extends BioinformaticsType {
  type: "Tree";
  id: number;
  name?: string;
  pathogenGenomeCount: number;
  creationDate: string;
  downloadLink?: string;
}

type BioinformaticsData = Sample | Tree;
type BioinformaticsDataArray = Sample[] | Tree[];
