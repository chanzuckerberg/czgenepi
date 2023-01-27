import { TableHeader } from "./types";

export const PRIVATE_ID_HEADER: TableHeader<Sample> = {
  key: "privateId",
  text: "Private ID",
};

export const PUBLIC_ID_HEADER: TableHeader<Sample> = {
  key: "publicId",
  text: "Public ID",
};

export const COLLECTION_DATE_HEADER: TableHeader<Sample> = {
  key: "collectionDate",
  text: "Collection Date",
};

export const LINEAGE_HEADER: TableHeader<Sample> = {
  key: "lineages",
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
};

export const QC_METRICS_HEADER: TableHeader<Sample> = {
  key: "qcMetrics",
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
  ],
  text: "QC Metrics",
};

export const UPLOAD_DATE_HEADER: TableHeader<Sample> = {
  key: "uploadDate",
  text: "Upload Date",
};

export const COLLECTION_LOCATION_HEADER: TableHeader<Sample> = {
  key: "collectionLocation",
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
};

export const SEQUENCING_DATE_HEADER: TableHeader<Sample> = {
  key: "sequencingDate",
  text: "Sequencing Date",
};

export const GISAID_HEADER: TableHeader<Sample> = {
  key: "gisaid",
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
};

// Not used yet, but added here to keep the tooltip and header updates in one place
export const GENBANK_HEADER: TableHeader<Sample> = {
  key: "genbank",
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
};
