export const PRIVATE_ID_HEADER: Header = {
  key: "privateId",
  sortKey: ["privateId"],
  text: "Private ID",
  tooltip: {
    boldText: "Private ID",
    regularText:
      "User-provided private ID. Only users in your Group can see it.",
  },
};

export const PUBLIC_ID_HEADER: Header = {
  key: "publicId",
  sortKey: ["publicId"],
  text: "Public ID",
  tooltip: {
    boldText: "Public ID",
    regularText:
      "This is your GenBank Accession or public ID generated by CZ GEN EPI.",
  },
};

export const COLLECTION_DATE_HEADER: Header = {
  key: "collectionDate",
  sortKey: ["collectionDate"],
  text: "Collection Date",
  tooltip: {
    boldText: "Collection Date",
    regularText:
      "User-provided date on which the sample was collected from an individual or an environment.",
  },
};

export const LINEAGE_HEADER: Header = {
  key: "lineages",
  sortKey: ["lineage", "lineage"],
  subHeaders: [
    {
      key: "lineage",
      text: "Lineage",
    },
    {
      key: "scorpio_call",
      text: "Scorpio Call",
    },
    {
      key: "scorpio_support",
      text: "Scorpio Support",
    },
    {
      key: "last_updated",
      text: "Last Updated",
    },
    {
      key: "lineage_software_version",
      text: "Version",
    },
    {
      key: "reference_dataset_name",
      text: "Reference Dataset Name",
    },
    {
      key: "lineage_type",
      text: "Lineage Caller",
    },
    {
      key: "reference_dataset_tag",
      text: "Reference Dataset Tag",
    },
    {
      key: "reference_sequence_accession",
      text: "Reference Sequence Accession",
    },
    {
      key: "lineage_probability",
      text: "Lineage Probability",
    },
  ],
  text: "Lineage",
  tooltip: {
    boldText: "Lineage",
    link: {
      href: "https://cov-lineages.org/pangolin.html",
      linkText: "Learn more.",
    },
    regularText:
      'A lineage is a named group of related sequences. This may sometimes be referred to as a "genotype," "subtype," or "variant." Some lineages are associated with changes in the epidemiological, biological or clinical characteristics of the pathogen. We update these lineages regularly whenever there are new designations available.',
  },
};


export const QC_METRICS_HEADER: Header = {
  key: "qcMetrics",
  sortKey: ["lineage", "lineage"],
  subHeaders: [
    {
      key: "qc_caller",
      text: "QC Caller",
    },
    {
      key: "qc_score",
      text: "QC Score",
    },
    {
      key: "qc_software_version",
      text: "QC Software Version",
    },
    {
      key: "qc_status",
      text: "QC Status",
    },
    {
      key: "reference_dataset_name",
      text: "Reference Dataset Name",
    },
    {
      key: "reference_dataset_tag",
      text: "Reference Dataset Tag",
    },
    {
      key: "reference_sequence_accession",
      text: "Reference Sequence Accession",
    },
  ],
  text: "QC Metrics",
  tooltip: {
    boldText: "QC Metrics",
    link: {
      href: "https://cov-lineages.org/pangolin.html",
      linkText: "Learn more.",
    },
    regularText:
      'A lineage is a named group of related sequences. This may sometimes be referred to as a "genotype," "subtype," or "variant." Some lineages are associated with changes in the epidemiological, biological or clinical characteristics of the pathogen. We update these lineages regularly whenever there are new designations available.',
  },
};


export const UPLOAD_DATE_HEADER: Header = {
  key: "uploadDate",
  sortKey: ["uploadDate"],
  text: "Upload Date",
  tooltip: {
    boldText: "Upload Date",
    regularText: "Date on which the sample was uploaded to CZ Gen Epi.",
  },
};

export const COLLECTION_LOCATION_HEADER: Header = {
  key: "collectionLocation",
  sortKey: ["collectionLocation"],
  subHeaders: [
    {
      key: "region",
      text: "Region",
    },
    {
      key: "country",
      text: "Country",
    },
    {
      key: "division",
      text: "Division",
    },
    {
      key: "location",
      text: "Location",
    },
  ],
  text: "Collection Location",
  tooltip: {
    boldText: "Collection Location",
    regularText:
      "User-provided geographic location where the sample was collected (at the county level or above).",
  },
};

export const SEQUENCING_DATE_HEADER = {
  key: "sequencingDate",
  sortKey: ["sequencingDate"],
  text: "Sequencing Date",
  tooltip: {
    boldText: "Sequencing Date",
    regularText: "User-provided date on which the sample was sequenced.",
  },
};

export const GISAID_HEADER = {
  key: "gisaid",
  sortKey: ["gisaid", "status"],
  subHeaders: [
    {
      key: "status",
      text: "GISAID Status",
    },
    {
      key: "gisaid_id",
      text: "GISAID ID",
    },
  ],
  text: "GISAID",
  tooltip: {
    boldText: "GISAID Status",
    regularText:
      "Whether your sample has been Not Yet Submitted, Submitted, Accepted (with GISAID accession), Rejected, or Not Eligible (marked private).",
  },
};

// Not used yet, but added here to keep the tooltip and header updates in one place
export const GENBANK_HEADER = {
  key: "genbank",
  sortKey: ["genbank", "status"],
  subHeaders: [
    {
      key: "status",
      text: "GenBank Status",
    },
    {
      key: "genbank_accession",
      text: "GenBank Accession",
    },
  ],
  text: "Genbank",
  tooltip: {
    boldText: "GenBank Status",
    regularText:
      "Whether your sample has been Not Yet Submitted, Submitted, Accepted (with GenBank GI number), Rejected or Not Eligible (marked private).",
  },
};
