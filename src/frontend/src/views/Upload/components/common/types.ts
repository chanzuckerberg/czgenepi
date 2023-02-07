import { SampleIdToMetadata } from "src/components/WebformTable/common/types";

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
export interface Props {
  samples: Samples | null;
  setSamples: React.Dispatch<React.SetStateAction<Samples | null>>;
  namedLocations: NamedGisaidLocation[];
  metadata: SampleIdToMetadata | null;
  setMetadata: React.Dispatch<React.SetStateAction<SampleIdToMetadata | null>>;
  cancelPrompt: () => void;
  analyticsFlowUuid: string;
  hasManuallyEditedMetadata: boolean;
  setHasManuallyEditedMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  hasImportedMetadataFile: boolean;
  setHasImportedMetadataFile: React.Dispatch<React.SetStateAction<boolean>>;
}
