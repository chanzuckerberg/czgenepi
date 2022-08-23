import { Dictionary, invert } from "lodash";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleUploadTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";

// When parsing upload of metadata, we use a flipped version of SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.
// Note: there is a distinction between "real" `collectionLocation` internally
// in app (it's an object) and user-submitted collectionLocation via metadata
// upload (it's a string). The file parser will handle this conversion.
export const HEADERS_TO_METADATA_KEYS = invert(
  SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS
) as Dictionary<keyof SampleUploadTsvMetadata>;

export const NEXTSTRAIN_FORMAT_HEADERS_TO_METADATA_KEYS: Record<
  string,
  string
> = {
  date: "collectionDate",
  location: "collectionLocation",
  gisaid_epi_isl: "publicId",
  strain: "strain",
};

// We don't send all metadata keys to API. sampleId is not persisted.
type KEYS_SENT_TO_API = Omit<SampleUploadTsvMetadata, "sampleId">;
export const METADATA_KEYS_TO_API_KEYS: Record<keyof KEYS_SENT_TO_API, string> =
  {
    collectionDate: "collection_date",
    collectionLocation: "location_id",
    keepPrivate: "private",
    privateId: "private_identifier",
    publicId: "public_identifier",
    sequencingDate: "sequencing_date",
  };

export const EMPTY_METADATA: SampleUploadTsvMetadata = {
  collectionDate: "",
  collectionLocation: undefined,
  keepPrivate: false,
  privateId: "",
  publicId: "",
  sampleId: "",
  sequencingDate: "",
};

// (thuang): The sample count that the page starts to lag
export const SAMPLE_COUNT = 30;

/**
 * Various constraints on "names" pertaining to sequences/samples.
 *
 * "Name" is a bit amorphous here: it can mean either the sequence's name
 * specified via incoming FASTA data (usually `sampleId` in the Upload flow)
 * OR it can be the Private ID (`privateId`) that the user specifies for the
 * sequence during the Metadata step of overall flow. We don't distinguish
 * between the two types of sequence name here because, generally, the FASTA
 * name for a sequence will directly lead into the Private ID it gets. So to
 * avoid confusing the user, we have the same requirements for them both.
 *
 * [Sidebar: In theory, we could apply the same resrictions to the Public ID
 * (`publicId`), but because that string should exactly match the one in an
 * external database, we don't enforce any requirements.]
 */
export const MAX_NAME_LENGTH = 120;
// All the characters that we do NOT allow for sample name.
// Effectively just a whitelist of characters, then negated to produce what's forbidden.
// Allowed characters: all latin alphabet, all digits, ` ` (space), `.`, `_`, `/`, `-`
export const FORBIDDEN_NAME_CHARACTERS_REGEX = /[^a-zA-Z0-9 ._/-]/;
// Above is generally preferable for clarity of intent, but in some cases we
// have to test for the positive, allowed case instead (i.e., Yup validation)
// Start of string to end of string, only use allowed chars (see above).
export const VALID_NAME_REGEX = /^[a-zA-Z0-9 ._/-]+$/;
