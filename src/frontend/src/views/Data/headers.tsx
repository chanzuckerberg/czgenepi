// TODO: (ehoops) - we should refactor this config to follow the same pattern as the samples table
export const TREE_HEADERS: Header[] = [
  {
    key: "name",
    sortKey: ["name"],
    text: "Tree Name",
    tooltip: {
      boldText: "Tree Name",
      regularText:
        "User-provided tree name. Auto-generated tree builds are named ”Y Contextual“, where Y is your Group Name.",
    },
  },
  {
    key: "startedDate",
    sortKey: ["startedDate"],
    // using startedDate instead of creationDate,
    // startedDate is populated for all phylorun statuses, creationDate only applies to completed trees
    text: "Creation Date",
    tooltip: {
      boldText: "Creation Date",
      regularText: "Date on which the tree was generated.",
    },
  },
  {
    key: "treeType",
    sortKey: ["treeType"],
    text: "Tree Type",
    tooltip: {
      boldText: "Tree Type",
      link: {
        href: "https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing",
        linkText: "Read our guide to learn more.",
      },
      regularText:
        "CZ Gen Epi-defined profiles for tree building based on primary use case and build settings.",
    },
  },
  {
    key: "actionMenu",
    sortKey: [],
    text: "",
  },
];
