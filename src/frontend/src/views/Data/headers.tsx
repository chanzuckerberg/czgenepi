import { TableHeader } from "./tableHeaders/types";

type TreeTableHeader = Omit<TableHeader<PhyloRun>, "key"> & {
  key: keyof PhyloRun | "actionMenu";
};

// TODO: (ehoops) - we should refactor this config to follow the same pattern as the samples table
export const TREE_HEADERS: TreeTableHeader[] = [
  {
    key: "name",
    text: "Tree Name",
  },
  {
    key: "startedDate",
    // using startedDate instead of creationDate,
    // startedDate is populated for all phylorun statuses, creationDate only applies to completed trees
    text: "Creation Date",
  },
  {
    key: "treeType",
    text: "Tree Type",
  },
  {
    key: "actionMenu",
    text: "",
  },
];
