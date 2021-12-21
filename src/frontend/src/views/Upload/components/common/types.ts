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
   */
  AUTO_CORRECT,
}

export enum ERROR_CODE {
  DEFAULT, // BAD FILE NAME
  INVALID_NAME,
  MISSING_FIELD,
  OVER_MAX_SAMPLES,
}

export interface DEFAULT {
  code: 1;
  message: "test message";
}

export interface INVALID_NAME {
  code: 2;
  message: "test message invalid name";
}

export interface ErrorCode {
  code: ERROR_CODE;
  filename: string;
}

interface CommonMetadata {
  sampleId?: string;
  collectionDate?: string;
  islAccessionNumber?: string;
  keepPrivate?: boolean;
  publicId?: string;
  sequencingDate?: string;
  submittedToGisaid?: boolean;
}

// used by the app
export interface Metadata extends CommonMetadata {
  collectionLocation?: NamedGisaidLocation;
}

// parsed from the TSV
export interface ParsedMetadata extends CommonMetadata {
  locationString?: string;
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
export type SampleIdToParsedMetadata = Record<string, ParsedMetadata>;
