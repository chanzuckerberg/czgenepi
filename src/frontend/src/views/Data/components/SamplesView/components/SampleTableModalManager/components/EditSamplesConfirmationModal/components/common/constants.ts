import { Dictionary, invert } from "lodash";
import { SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleEditTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";

// When parsing upload of metadata, we use a flipped version of HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS.
// Note: there is a distinction between "real" `collectionLocation` internally
// in app (it's an object) and user-submitted collectionLocation via metadata
// upload (it's a string). The file parser will handle this conversion.
export const HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS = invert(
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS
) as Dictionary<keyof SampleEditTsvMetadata>;
