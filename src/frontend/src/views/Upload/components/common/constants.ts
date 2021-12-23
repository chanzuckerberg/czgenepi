import { invert, omitBy } from "lodash";
import {
  Metadata,
  ParsedMetadata,
} from "src/views/Upload/components/common/types";

// Internal keys we use to represent to various kinds of metadata on a sample
// and the user-visible name we give the info, seen as a header on column.
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

// When parsing file upload of metadata, we use the flipped version of above.
// Slightly different though, see comments inside.
export const HEADERS_TO_METADATA_KEYS = invert(omitBy(
  {
  // Generally we use all the same, but now flipped to be Header name -> key
  ...METADATA_KEYS_TO_HEADERS,
  // However! We do not directly collect `collectionLocation` in file upload.
  // That's actually an object internally, so can't parse. Mark as unused.
  collectionLocation: "UNUSED", // Will get stripped entirely via `omitBy`
  // Instead, we collect a canonical string that refers to the location.
  // We still give same user-facing name, but internally used differently.
  // This string will get converted later into a "real" collectionLocation.
  locationString: "Collection Location",
  },
  val => val === "UNUSED", // Omits anything we marked as UNUSED above
)) as Record<string, keyof ParsedMetadata>;

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
