export const SAMPLE_HEADERS: Header[] = [
  {
    key: "privateId",
    sortKey: ["privateId"],
    text: "Private ID",
  },
  {
    key: "publicId",
    sortKey: ["publicId"],
    text: "Public ID",
  },
  {
    key: "uploadDate",
    sortKey: ["uploadDate"],
    text: "Upload Date",
  },
  {
    key: "collectionDate",
    sortKey: ["collectionDate"],
    text: "Collection Date",
  },
  {
    key: "collectionLocation",
    sortKey: ["collectionLocation"],
    text: "Collection Location",
  },
  {
    key: "lineage",
    sortKey: ["lineage", "lineage"],
    text: "Lineage",
  },
  {
    key: "gisaid",
    sortKey: ["gisaid", "status"],
    text: "GISAID",
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
    key: "name",
    sortKey: ["name"],
    text: "Tree Name",
  },
  {
    key: "creationDate",
    sortKey: ["creationDate"],
    text: "Creation Date",
  },
  {
    align: "center",
    key: "treeType",
    sortKey: ["treeType"],
    text: "Tree Type",
  },
  {
    key: "downloadLink",
    sortKey: ["downloadLink"],
    text: "",
  },
];
