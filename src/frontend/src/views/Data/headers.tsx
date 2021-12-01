export const SAMPLE_HEADERS: Header[] = [
  {
    key: "privateId",
    sortKey: ["privateId"],
    text: "Private ID",
    tooltip: {
      boldText: "Private ID",
      regularText:
        "User-provided private ID. Only users in your Group can see it.",
    },
  },
  {
    key: "publicId",
    sortKey: ["publicId"],
    text: "Public ID",
    tooltip: {
      boldText: "Public ID",
      regularText: "This is your GISAID ID or public ID generated by Aspen.",
    },
  },
  {
    key: "collectionDate",
    sortKey: ["collectionDate"],
    text: "Collection Date",
    tooltip: {
      boldText: "Collection Date",
      regularText:
        "User-provided date on which the sample was collected from an individual or an environment.",
    },
  },
  {
    key: "lineage",
    sortKey: ["lineage", "lineage"],
    text: "Lineage",
    tooltip: {
      boldText: "Lineage",
      link: {
        href: "https://cov-lineages.org/pangolin.html",
        linkText: "Learn more.",
      },
      regularText:
        "A lineage is a named group of related sequences. A few lineages have been associated with changes in the epidemiological or biological characteristics of the virus. We continually update these lineages based on the evolving Pangolin designations. Lineages determined by Pangolin.",
    },
  },
  {
    key: "uploadDate",
    sortKey: ["uploadDate"],
    text: "Upload Date",
    tooltip: {
      boldText: "Upload Date",
      regularText: "Date on which the sample was uploaded to Aspen.",
    },
  },
  {
    key: "collectionLocation",
    sortKey: ["collectionLocation"],
    text: "Collection Location",
    tooltip: {
      boldText: "Collection Location",
      regularText:
        "User-provided geographic location where the sample was collected (at the county level or above).",
    },
  },
  {
    key: "sequencingDate",
    sortKey: ["sequencingDate"],
    text: "Sequencing Date",
    tooltip: {
      boldText: "Sequencing Date",
      regularText: "User-provided date on which the sample was sequenced.",
    },
  },
  {
    key: "gisaid",
    sortKey: ["gisaid", "status"],
    text: "GISAID",
    tooltip: {
      boldText: "GISAID Status",
      regularText:
        "Whether your sample has been Not Yet Submitted, Submitted, Accepted (with GISAID ID), Rejected, or Not Eligible (marked private).",
    },
  },
];

export const SAMPLE_SUBHEADERS: Record<string, SubHeader[]> = {
  gisaid: [
    {
      key: "status",
      text: "GISAID Status",
    },
    {
      key: "gisaid_id",
      text: "GISAID ID",
    },
  ],
  lineage: [
    {
      key: "lineage",
      text: "Lineage",
    },
    {
      key: "probability",
      text: "Probability",
    },
    {
      key: "last_updated",
      text: "Last Updated",
    },
    {
      key: "version",
      text: "Version",
    },
  ],
};

export const TREE_HEADERS: Header[] = [
  {
    align: "left",
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
        "Aspen-defined profiles for tree building based on primary use case and build settings.",
    },
  },
  {
    key: "downloadLink",
    sortKey: ["downloadLink"],
    text: "",
  },
];
