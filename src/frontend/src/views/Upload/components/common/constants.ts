import invert from "lodash/invert";
import {
  Metadata,
  ParsedMetadata,
} from "src/views/Upload/components/common/types";

export const METADATA_KEYS_TO_HEADERS: Record<keyof Metadata, string> = {
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  islAccessionNumber: "ISL Accession # (optional)",
  keepPrivate: "Sample is Private",
  publicId: "GISAID ID (Public ID)",
  sampleId: "Sample Private ID",
  sequencingDate: "Sequencing Date (optional)",
  submittedToGisaid: "Previously Submitted to GISAID?",
};

// When parsing Metadata TSV files, the "Collection Location" column is a string that we convert to
// a GisaidLocation.
export const HEADERS_TO_METADATA_KEYS = invert({
  ...METADATA_KEYS_TO_HEADERS,
  collectionLocation: "UNUSED",
  locationString: "Collection Location",
}) as Record<string, keyof ParsedMetadata>;

export const METADATA_KEYS_TO_API_KEYS: Record<keyof Metadata, string> = {
  collectionDate: "collection_date",
  collectionLocation: "location_id",
  islAccessionNumber: "isl_access_number",
  keepPrivate: "private",
  publicId: "public_identifier",
  sampleId: "private_identifier",
  sequencingDate: "sequencing_date",
  submittedToGisaid: "submitted_to_gisaid",
};

export const EMPTY_METADATA: Metadata = {
  collectionDate: "",
  collectionLocation: undefined,
  islAccessionNumber: "",
  keepPrivate: false,
  publicId: "",
  sequencingDate: "",
  submittedToGisaid: false,
};

// (thuang): The sample count that the page starts to lag
export const SAMPLE_COUNT = 30;
