import { SampleUploadTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";

// interface for the sample edit tsv webform
export type SampleEditMetadataWebform = Omit<
  SampleUploadTsvMetadata,
  "sampleId"
>;

export enum WARNING_CODE {
  /**
   * (thuang): We have detected conflicting info and auto-corrected something
   * for the user
   * (Vince -- Jan 28, 2022): Currently unused due to change in when we auto
   * correct. While won't occur right now, there is an upcoming feature for
   * providing notice when parsing uploaded collectionLocation, so leaving
   * this warning type in for now.
   */
  AUTO_CORRECT,
  // Metadata row in upload was missing required data for one or more fields
  MISSING_DATA,
  // Metdata row in upload was not found in user's previously uploaded samples
  EXTRANEOUS_ENTRY,
  // Sample ID appeared in user's sequence upload, but not in metadata upload
  ABSENT_SAMPLE,
  // A piece of data is present, but improperly formatted
  BAD_FORMAT_DATA,
  // A column is present that isn't in our template
  UNKNOWN_DATA_FIELDS,
  // No exact location match found, so we choose the closest one we can find for them
  BAD_LOCATION_FORMAT,
}

export enum ERROR_CODE {
  DEFAULT, // BAD FILE NAME
  DUPLICATE_IDS,
  INVALID_NAME,
  MISSING_FIELD, // Missing required column entirely: no header field found
  OVER_MAX_SAMPLES,
}

export interface Metadata {
  // `sampleId`, unlike all others, should not be user-editable in Metadata
  // step. Instead, it IDs the sample that this metadata is tied to.
  sampleId?: string;
  privateId?: string;
  collectionDate?: string;
  keepPrivate?: boolean;
  publicId?: string;
  sequencingDate?: string;
  collectionLocation?: NamedGisaidLocation;
}

export type SampleIdToMetadata = Record<string, Metadata>;

export type SampleIdToEditMetadataWebform = Record<
  string,
  SampleEditMetadataWebform
>;
