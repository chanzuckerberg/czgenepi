import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import { METADATA_KEYS_TO_API_KEYS } from "src/views/Upload/components/common/constants";
import {
  SampleIdToMetadata,
  Samples,
} from "src/views/Upload/components/common/types";
import {
  API,
  DEFAULT_DELETE_OPTIONS,
  DEFAULT_POST_OPTIONS,
  fetchSamples,
  SampleResponse,
} from "../api";
import { API_URL } from "../constants/ENV";
import { ENTITIES } from "./entities";
import { MutationCallbacks } from "./types";

/**
 * Download fasta file for samples
 */
interface SampleFastaDownloadPayload {
  requested_sequences: {
    sample_ids: string[];
  };
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

/**
 * validate sample ids for addition to trees
 */
interface ValidateSampleIdentifiersPayload {
  sample_ids: string[];
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

export function useValidateSampleIds({
  componentOnError,
  componentOnSuccess,
}: SampleValidationCallbacks): UseMutationResult<
  SampleValidationResponseType,
  unknown,
  SampleValidationRequestType,
  unknown
> {
  return useMutation(validateSampleIdentifiers, {
    onError: componentOnError,
    onSuccess: componentOnSuccess,
  });
}

/**
 * create new samples
 */
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
        [METADATA_KEYS_TO_API_KEYS.collectionLocation]: collectionLocation!.id,
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

/**
 * sample cache
 */

export const USE_SAMPLE_INFO = {
  entities: [ENTITIES.SAMPLE_INFO],
  id: "sampleInfo",
};

export function useSampleInfo(): UseQueryResult<SampleResponse, unknown> {
  return useQuery([USE_SAMPLE_INFO], fetchSamples, {
    retry: false,
  });
}

// * Proceed with caution, you are entering the DANGER ZONE!
// * Code below this line is destructive!

/**
 * delete samples
 */
interface DeleteSamplesPayload {
  ids: number[];
}

export async function deleteSamples({
  samplesToDelete,
}: SampleDeleteRequestType): Promise<SampleDeleteResponseType> {
  const payload: DeleteSamplesPayload = {
    ids: samplesToDelete,
  };

  const response = await fetch(API_URL + API.SAMPLES, {
    ...DEFAULT_DELETE_OPTIONS,
    body: JSON.stringify(payload),
  });

  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

interface SampleDeleteRequestType {
  samplesToDelete: number[];
}

export interface SampleDeleteResponseType {
  ids: string[];
}

type SampleDeleteCallbacks = MutationCallbacks<SampleDeleteResponseType>;

export function useDeleteSamples({
  componentOnError,
  componentOnSuccess,
}: SampleDeleteCallbacks): UseMutationResult<
  SampleDeleteResponseType,
  unknown,
  SampleDeleteRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  // TODO (mlila): pick less confusing name choices for callbacks/params
  return useMutation(deleteSamples, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_SAMPLE_INFO]);
      componentOnSuccess(data);
    },
  });
}
