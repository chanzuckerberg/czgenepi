export enum VIEWNAME {
  SAMPLES = "Samples",
  TREES = "Phylogenetic Trees",
}

export enum TREE_STATUS {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Started = "STARTED",
}

export const TreeTypes = {
  Targeted: "TARGETED",
  NonContextualized: "NON_CONTEXTUALIZED",
  Overview: "OVERVIEW",
};

export type TreeType = typeof TreeTypes[keyof typeof TreeTypes];
