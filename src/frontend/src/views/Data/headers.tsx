export const SAMPLE_HEADERS: Header[] = [
  {
    key: "privateId",
    text: "Private ID",
  },
  {
    key: "publicId",
    text: "Public ID",
  },
  {
    key: "uploadDate",
    text: "Upload Date",
  },
  {
    key: "collectionDate",
    text: "Collection Date",
  },
  {
    key: "collectionLocation",
    text: "Collection Location",
  },
  {
    key: "lineage",
    text: "Lineage",
  },
  {
    key: "gisaid",
    text: "GISAID",
  },
];

export const SAMPLE_SUBHEADERS: Record<string, Header[]> = {
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
    text: "Tree Name",
  },
  {
    key: "creationDate",
    text: "Creation Date",
  },
  {
    key: "downloadLink",
    text: "",
  },
];
