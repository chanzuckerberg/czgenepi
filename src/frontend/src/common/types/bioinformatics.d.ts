interface GISAID {
  status: "submitted" | "not_eligible" | "accepted" | "rejected" | "no_info";
  gisaidId?: string;
}

interface Genbank {
  status: string;
  genbankAccession: string;
}

interface Genbank {
  status: string;
  genbank_accession: string;
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

interface Sample {
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
  genbank: Genbank;
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
interface PhyloRun {
  type: "Tree";
  id?: number;
  name: string;
  startedDate: string;
  workflowId: string;
  status: TREE_STATUS;
  templateArgs: TemplateArgs;
  accessionsLink?: string;
  downloadLinkIdStylePrivateIdentifiers?: string;
  downloadLinkIdStylePublicIdentifiers?: string;
  treeType?: TreeType;
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
