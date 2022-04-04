// (thuang): Key is sample id, value is sequence
export type Sequences = Record<string, string>;

export interface Sample {
  sequence: string;
  filename: string;
}

export interface NamedGisaidLocation extends GisaidLocation {
  name: string;
}

export type Samples = Record<string, Sample>;

export type ParseErrors = Record<string, string[]>;

export interface ParseOutcomeWithFilenames {
  result: Samples;
  errors: ParseErrors;
}

export interface ParseOutcome {
  result: Sequences;
  errors: ParseErrors;
}

export interface ParseFastaSeqIDLineOutcome {
  hasError: boolean;
  id: string;
}

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
}

export enum ERROR_CODE {
  DEFAULT, // BAD FILE NAME
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
export interface Props {
  samples: Samples | null;
  setSamples: React.Dispatch<React.SetStateAction<Samples | null>>;
  namedLocations: NamedGisaidLocation[];
  metadata: SampleIdToMetadata | null;
  setMetadata: React.Dispatch<React.SetStateAction<SampleIdToMetadata | null>>;
  cancelPrompt: () => void;
}

export type SampleIdToMetadata = Record<string, Metadata>;
