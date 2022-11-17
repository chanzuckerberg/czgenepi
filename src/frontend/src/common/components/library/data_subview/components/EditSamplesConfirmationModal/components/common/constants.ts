import { Dictionary, invert } from "lodash";
import { Pathogen } from "src/common/redux/types";
import { SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleEditTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";

// When parsing upload of metadata, we use a flipped version of HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS.
// Note: there is a distinction between "real" `collectionLocation` internally
// in app (it's an object) and user-submitted collectionLocation via metadata
// upload (it's a string). The file parser will handle this conversion.
export const getHeadersToSampleEditMetadataKeys = (
  pathogen: Pathogen
): Dictionary<keyof SampleEditTsvMetadata> => {
  const keysToHeaders = SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen];
  return invert(keysToHeaders) as Dictionary<keyof SampleEditTsvMetadata>;
};
