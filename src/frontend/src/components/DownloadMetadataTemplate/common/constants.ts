import { SampleEditTsvMetadata, SampleUploadTsvMetadata } from "./types";

// Some columns are for optional data. Below string is added to end of the
// header describing what data is in column to indicate it is optional.
export const OPTIONAL_HEADER_MARKER = " - Optional";

// Internal keys we use to represent to various kinds of metadata on a sample
// and the user-visible name we give the info, seen as a header on column.
const BASE_METADATA_HEADERS = {
  // Headers that are shared between upload and edit sample metadata tsvs
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  keepPrivate: "Sample is Private",
  sequencingDate: "Sequencing Date" + OPTIONAL_HEADER_MARKER,
};

export const SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleUploadTsvMetadata,
  string
> = {
  ...BASE_METADATA_HEADERS,
  privateId: "Private ID",
  publicId: "GISAID ID (Public ID)" + OPTIONAL_HEADER_MARKER,
  sampleId: "Sample Name (from FASTA)",
};

export const SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleEditTsvMetadata,
  string
> = {
  ...BASE_METADATA_HEADERS,
  currentPrivateID: "Current Private ID",
  newPrivateID: "New Private ID" + OPTIONAL_HEADER_MARKER,
  publicId: "Public ID (GISAID ID)",
};
