interface BioinformaticsType {
  [index: string]: JSONPrimitive;
  type: "BioinformaticsType";
}

interface GISAID {
  status: "submitted" | "not_eligible" | "accepted" | "rejected" | "no_info";
  gisaidId?: string;
}

interface Genbank {
  status: string;
  genbankAccession: string;
}

interface Lineage {
  lineage: string;
  lineageType: string;
  lineageSoftwareVersion: string;
  lineageProbability?: string;
  lastUpdated?: string;
  referenceDatasetName?: string;
  referenceSequenceAccession?: string;
  referenceDatasetTag?: string;
  scorpioCall?: string;
  scorpioSupport?: string;
  qcStatus?: string;
}

interface QCMetrics {
  qcScore?: string;
  qcSoftwareVersion: string;
  qcStatus: string;
  qcCaller: string;
  referenceDatasetName?: string;
  referenceSequenceAccession?: string;
  referenceDatasetTag?: string;
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
  lineages: [Lineage];
  qcMetrics: [QCMetrics];
  private?: boolean;
}

interface Tree {
  name: string;
  id: number;
}

interface TemplateArgs {
  filterPangoLineages?: Array<string>;
  filterStartDate?: string;
  filterEndDate?: string;
  locationId?: number;
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
  templateArgs: TemplateArgs;
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
