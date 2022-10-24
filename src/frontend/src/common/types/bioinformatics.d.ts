interface BioinformaticsType {
  [index: string]: JSONPrimitive;
  type: "BioinformaticsType";
}

interface GISAID {
  status: "submitted" | "not_eligible" | "accepted" | "rejected" | "no_info";
  gisaid_id?: string;
}

interface Lineage {
  last_updated: string;
  lineage: string;
  qc_status: string;
  scorpio_call: string;
  scorpio_support: string;
  version: string;
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
}

interface Tree {
  name: string;
  id: number;
}

/**
 * A phylo run actually differs from a phylo tree.
 * A run is generated any time we make an attempt to make a tree, but not all runs have trees
 * associated with them (for example, while a run is in progress, or when a run has failed).
 */
interface PhyloRun extends BioinformaticsType {
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
  phyloTree?: Tree;
}

// TODO-TR (mlila): remove these types after removing transforms from Data/index.tsx
type BioinformaticsData = Sample | PhyloRun;
type BioinformaticsDataArray = Array<Sample> | Array<PhyloRun>;

interface SampleMap {
  [key: string]: Sample;
}

interface PhyloRunMap {
  [key: string]: PhyloRun;
}

type BioinformaticsMap = SampleMap | PhyloRunMap;
