// (thuang): Key is sample id, value is sequence
export type Sequences = Record<string, string>;

export interface Sample {
  sequence: string;
  filename: string;
}

export type Samples = Record<string, Sample>;

export type ParseErrors = Record<number, string[]>;

export interface ParseOutcomeWithFilenames {
  result: Samples;
  errors: ParseErrors;
}

export interface ParseOutcome {
  result: Sequences;
  errors: ParseErrors;
}

export enum ERROR_CODE {
  DEFAULT,
  INVALID_NAME,
}

export interface ErrorCode {
  code: ERROR_CODE;
  filename: string;
}

export interface Metadata {
  collectionDate?: string;
  collectionLocation?: string;
  islAccessionNumber?: string;
  keepPrivate?: boolean;
  publicId?: string;
  sequencingDate?: string;
  submittedToGisaid?: boolean;
}

export interface Props {
  samples: Samples | null;
  setSamples: React.Dispatch<React.SetStateAction<Samples | null>>;
  metadata: SampleIdToMetadata | null;
  setMetadata: React.Dispatch<React.SetStateAction<SampleIdToMetadata | null>>;
}

export type SampleIdToMetadata = Record<string, Metadata>;
