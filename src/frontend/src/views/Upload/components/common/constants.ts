import { Dictionary, invert } from "lodash";
import { Metadata } from "src/views/Upload/components/common/types";

// Internal keys we use to represent to various kinds of metadata on a sample
// and the user-visible name we give the info, seen as a header on column.
export const METADATA_KEYS_TO_HEADERS: Record<keyof Metadata, string> = {
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  keepPrivate: "Sample is Private",
  publicId: "GISAID ID (Public ID)",
  sampleId: "Sample Private ID",
  sequencingDate: "Sequencing Date (optional)",
};

// When parsing upload of metadata, we use a flipped version of above.
// Note: there is a distinction between "real" `collectionLocation` internally
// in app (it's an object) and user-submitted collectionLocation via metadata
// upload (it's a string). The file parser will handle this conversion.
export const HEADERS_TO_METADATA_KEYS = invert(
  METADATA_KEYS_TO_HEADERS
) as Dictionary<keyof Metadata>;

export const METADATA_KEYS_TO_API_KEYS: Record<keyof Metadata, string> = {
  collectionDate: "collection_date",
  collectionLocation: "location_id",
  keepPrivate: "private",
  publicId: "public_identifier",
  sampleId: "private_identifier",
  sequencingDate: "sequencing_date",
};

export const EMPTY_METADATA: Metadata = {
  collectionDate: "",
  collectionLocation: undefined,
  keepPrivate: false,
  publicId: "",
  sequencingDate: "",
};

// (thuang): The sample count that the page starts to lag
export const SAMPLE_COUNT = 30;
