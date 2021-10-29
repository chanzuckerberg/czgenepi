import invert from "lodash/invert";
import { Metadata } from "src/views/Upload/components/common/types";

export type ParsedMetadata = Record<
  "sampleId" | keyof Metadata,
  string | boolean | undefined
>;

export const METADATA_KEYS_TO_HEADERS: Record<keyof ParsedMetadata, string> = {
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  islAccessionNumber: "ISL Accession # (optional)",
  keepPrivate: "Sample is Private",
  publicId: "Sample Public ID",
  sampleId: "Sample Private ID",
  sequencingDate: "Sequencing Date (optional)",
  submittedToGisaid: "Previously Submitted to GISAID?",
};

export const HEADERS_TO_METADATA_KEYS = invert(
  METADATA_KEYS_TO_HEADERS
) as Record<string, keyof ParsedMetadata>;

export const METADATA_KEYS_TO_API_KEYS: Record<keyof ParsedMetadata, string> = {
  collectionDate: "collection_date",
  collectionLocation: "location",
  islAccessionNumber: "isl_access_number",
  keepPrivate: "private",
  publicId: "public_identifier",
  sampleId: "private_identifier",
  sequencingDate: "sequencing_date",
  submittedToGisaid: "submitted_to_gisaid",
};

// (thuang): The sample count that the page starts to lag
export const SAMPLE_COUNT = 30;
