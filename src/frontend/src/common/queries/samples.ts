import { useMutation, UseMutationResult } from "react-query";
import { METADATA_KEYS_TO_API_KEYS } from "src/views/Upload/components/common/constants";
import {
  SampleIdToMetadata,
  Samples,
} from "src/views/Upload/components/common/types";
import { API, DEFAULT_DELETE_OPTIONS, DEFAULT_POST_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";
import { MutationCallbacks } from "./types";

interface SamplePayload {
  sample: {
    private_identifier?: string;
    collection_date?: string;
    location?: string;
    private?: boolean;
  };
  pathogen_genome: {
    sequence: string;
  };
}

interface SampleFastaDownloadPayload {
  requested_sequences: {
    sample_ids: string[];
  };
}

interface ValidateSampleIdentifiersPayload {
  sample_ids: string[];
}

export async function downloadSamplesFasta({
  sampleIds,
}: {
  sampleIds: string[];
}): Promise<unknown> {
  const payload: SampleFastaDownloadPayload = {
    requested_sequences: { sample_ids: sampleIds },
  };
  const response = await fetch(API_URL + API.SAMPLES_FASTA_DOWNLOAD, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.blob();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export async function validateSampleIdentifiers({
  sampleIdsToValidate,
}: SampleValidationRequestType): Promise<SampleValidationResponseType> {
  const payload: ValidateSampleIdentifiersPayload = {
    sample_ids: sampleIdsToValidate,
  };

  const response = await fetch(API_URL + API.SAMPLES_VALIDATE_IDS, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

interface SampleValidationRequestType {
  sampleIdsToValidate: string[];
}

export interface SampleValidationResponseType {
  missing_sample_ids: string[];
}

type SampleValidationCallbacks =
  MutationCallbacks<SampleValidationResponseType>;

export function useValidateSampleIds(
  callbacks: SampleValidationCallbacks
): UseMutationResult<
  SampleValidationResponseType,
  unknown,
  SampleValidationRequestType,
  unknown
> {
  return useMutation(validateSampleIdentifiers, callbacks);
}

export async function createSamples({
  samples,
  metadata,
}: {
  samples: Samples | null;
  metadata: SampleIdToMetadata | null;
}): Promise<unknown> {
  const payload: SamplePayload[] = [];

  if (!samples || !metadata) {
    throw Error("`samples` and `metadata` cannot be empty");
  }

  for (const [sampleId, sample] of Object.entries(samples)) {
    const sampleMetadata = metadata[sampleId];
    const { sequence } = sample;
    const {
      collectionDate,
      collectionLocation,
      keepPrivate,
      sequencingDate,
      islAccessionNumber,
      publicId,
    } = sampleMetadata;

    const samplePayload = {
      pathogen_genome: {
        sequence,
        [METADATA_KEYS_TO_API_KEYS.sequencingDate]: sequencingDate,
        [METADATA_KEYS_TO_API_KEYS.islAccessionNumber]: islAccessionNumber,
      },
      sample: {
        [METADATA_KEYS_TO_API_KEYS.collectionDate]: collectionDate,
        [METADATA_KEYS_TO_API_KEYS.collectionLocation]: collectionLocation,
        [METADATA_KEYS_TO_API_KEYS.keepPrivate]: keepPrivate,
        [METADATA_KEYS_TO_API_KEYS.publicId]: publicId,
        private_identifier: sampleId,
      },
    };

    payload.push(samplePayload);
  }

  const response = await fetch(API_URL + API.SAMPLES_CREATE, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });

  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}
