import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/strings";
import { SampleEditTsvMetadata, SampleUploadTsvMetadata } from "./types";

// Some columns are for optional data. Below string is added to end of the
// header describing what data is in column to indicate it is optional.
export const OPTIONAL_HEADER_MARKER = " - Optional";

// Internal keys we use to represent to various kinds of metadata on a sample
// and the user-visible name we give the info, seen as a header on column.
export const BASE_METADATA_HEADERS = {
  // Headers that are shared between upload and edit sample metadata tsvs
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  keepPrivate: "Sample is Private",
  sequencingDate: "Sequencing Date" + OPTIONAL_HEADER_MARKER,
};

const GENERAL_VIRAL_SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleUploadTsvMetadata,
  string
> = {
  privateId: "Private ID",
  publicId: "Genbank Accession (GISAID ID)" + OPTIONAL_HEADER_MARKER,
  sampleId: "Sample Name (from FASTA)",
  ...BASE_METADATA_HEADERS,
};

export const SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS: PathogenConfigType<
  Record<keyof SampleUploadTsvMetadata, string>
> = {
  [Pathogen.COVID]: {
    privateId: "Private ID",
    publicId: "GISAID ID (Public ID)" + OPTIONAL_HEADER_MARKER,
    sampleId: "Sample Name (from FASTA)",
    ...BASE_METADATA_HEADERS,
  },
  [Pathogen.MONKEY_POX]: GENERAL_VIRAL_SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
};

const GENERAL_VIRAL_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleEditTsvMetadata,
  string
> = {
  ...BASE_METADATA_HEADERS,
  currentPrivateID: "Current Private ID",
  newPrivateID: "New Private ID" + OPTIONAL_HEADER_MARKER,
  publicId: "GenBank Accession (Public ID)",
};

export const SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS: PathogenConfigType<
  Record<keyof SampleEditTsvMetadata, string>
> = {
  [Pathogen.COVID]: {
    ...BASE_METADATA_HEADERS,
    currentPrivateID: "Current Private ID",
    newPrivateID: "New Private ID" + OPTIONAL_HEADER_MARKER,
    publicId: "Public ID (GISAID ID)",
  },
  [Pathogen.MONKEY_POX]: GENERAL_VIRAL_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
};
