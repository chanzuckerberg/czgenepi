import { MetadataExportHeader } from "./types";

export const PRIVATE_ID_HEADER: MetadataExportHeader<Sample> = {
  key: "privateId",
  text: "Private ID",
};

export const PUBLIC_ID_HEADER: MetadataExportHeader<Sample> = {
  key: "publicId",
  text: "Public ID",
};

export const COLLECTION_DATE_HEADER: MetadataExportHeader<Sample> = {
  key: "collectionDate",
  text: "Collection Date",
};

export const LINEAGE_HEADER: MetadataExportHeader<Sample> = {
  key: "lineages",
  subHeaders: [
    {
      key: "lineage",
      text: "Lineage",
    },
    {
      key: "scorpioCall",
      text: "Scorpio Call",
    },
    {
      key: "scorpioSupport",
      text: "Scorpio Support",
    },
    {
      key: "lastUpdated",
      text: "Last Updated",
    },
    {
      key: "lineageSoftwareVersion",
      text: "Version",
    },
    {
      key: "referenceDatasetName",
      text: "Reference Dataset Name",
    },
    {
      key: "lineageType",
      text: "Lineage Caller",
    },
    {
      key: "referenceDatasetTag",
      text: "Reference Dataset Tag",
    },
    {
      key: "referenceSequenceAccession",
      text: "Reference Sequence Accession",
    },
    {
      key: "lineageProbability",
      text: "Lineage Probability",
    },
  ],
  text: "Lineage",
};

export const QC_METRICS_HEADER: MetadataExportHeader<Sample> = {
  key: "qcMetrics",
  subHeaders: [
    {
      key: "qcCaller",
      text: "QC Caller",
    },
    {
      key: "qcScore",
      text: "QC Score",
    },
    {
      key: "qcSoftwareVersion",
      text: "QC Software Version",
    },
    {
      key: "qcStatus",
      text: "QC Status",
    },
  ],
  text: "QC Metrics",
};

export const UPLOAD_DATE_HEADER: MetadataExportHeader<Sample> = {
  key: "uploadDate",
  text: "Upload Date",
};

export const COLLECTION_LOCATION_HEADER: MetadataExportHeader<Sample> = {
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
  text: "Collection Location",
};

export const SEQUENCING_DATE_HEADER: MetadataExportHeader<Sample> = {
  key: "sequencingDate",
  text: "Sequencing Date",
};

export const GISAID_HEADER: MetadataExportHeader<Sample> = {
  key: "gisaid",
  subHeaders: [
    {
      key: "status",
      text: "GISAID Status",
    },
    {
      key: "gisaidId",
      text: "GISAID ID",
    },
  ],
  text: "GISAID",
};

// Not used yet, but added here to keep the tooltip and header updates in one place
export const GENBANK_HEADER: MetadataExportHeader<Sample> = {
  key: "genbank",
  subHeaders: [
    {
      key: "status",
      text: "GenBank Status",
    },
    {
      key: "genbankAccession",
      text: "GenBank Accession",
    },
  ],
  text: "Genbank",
};
