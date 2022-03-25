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
  confidencde: unknown;
  version: unknown;
}

enum TREE_STATUS {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Started = "STARTED",
}

interface Sample extends BioinformaticsType {
  id: number;
  type: "Sample";
  privateId: string;
  publicId: string;
  uploadDate: string;
  uploadedBy: {
    id: number;
    name: string;
  };
  collectionDate: string;
  collectionLocation: GisaidLocation;
  sequencingDate: string;
  submittingGroup: {
    id: number;
    name: string;
  };
  gisaid: GISAID;
  CZBFailedGenomeRecovery: boolean;
  lineage: Lineage;
  private?: boolean;
  importedBy?: string;
  importedAt?: string;
}

interface Tree extends BioinformaticsType {
  type: "Tree";
  id?: number;
  name: string;
  pathogenGenomeCount: number;
  creationDate: string;
  startedDate: string;
  workflowId: string;
  status: TREE_STATUS;
  downloadLinkIdStylePrivateIdentifiers?: string;
  downloadLinkIdStylePublicIdentifiers?: string;
  user: {
    name: string;
    id: number;
  };
  group: {
    name: string;
    id: number;
  };
}

type BioinformaticsData = Sample | Tree;
type BioinformaticsDataArray = Array<Sample> | Array<Tree>;

interface SampleMap {
  [key: string]: Sample;
}

interface TreeMap {
  [key: string]: Tree;
}

type BioinformaticsMap = SampleMap | TreeMap;
