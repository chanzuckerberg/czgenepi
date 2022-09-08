export type TreeInfo = {
  collectionDate?: {
    custom?: string;
    from?: string;
    to?: string;
  };
  forceIncludedSamples?: Array<string>;
  lineage: Array<string>;
  treeName: string;
  treeType: string;
};
