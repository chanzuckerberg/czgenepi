import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { SampleIdToMetadata } from "src/components/WebformTable/common/types";
import { METADATA_KEYS_TO_API_KEYS } from "src/views/Upload/components/common/constants";
import { Samples } from "src/views/Upload/components/common/types";
import {
  DEFAULT_DELETE_OPTIONS,
  DEFAULT_POST_OPTIONS,
  fetchSamples,
  generateOrgSpecificUrl,
  ORG_API,
  putBackendApiJson,
  SampleResponse,
} from "../api";
import { API_URL } from "../constants/ENV";
import { ENTITIES } from "./entities";
import { MutationCallbacks } from "./types";

/**
 * Download fasta file for samples
 */
interface SampleFastaDownloadPayload {
  sampleIds: string[];
}

type FastaDownloadCallbacks = MutationCallbacks<Blob>;

export async function downloadSamplesFasta({
  sampleIds,
}: {
  sampleIds: string[];
}): Promise<Blob> {
  const payload = {
    sample_ids: sampleIds,
  };
  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.SAMPLES_FASTA_DOWNLOAD),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );
  if (response.ok) return await response.blob();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useFastaDownload({
  componentOnError,
  componentOnSuccess,
}: FastaDownloadCallbacks): UseMutationResult<
  Blob,
  unknown,
  SampleFastaDownloadPayload,
  unknown
> {
  return useMutation(downloadSamplesFasta, {
    onError: componentOnError,
    onSuccess: componentOnSuccess,
  });
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

  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.SAMPLES_VALIDATE_IDS),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );
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

interface SampleCreateRequestType {
  samples: Samples | null;
  metadata: SampleIdToMetadata | null;
}

export async function createSamples({
  samples,
  metadata,
}: SampleCreateRequestType): Promise<unknown> {
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
      privateId,
      publicId,
    } = sampleMetadata;

    const collectionLocationId = () => {
      // collection location will always be a NamedGisaidLocation at this stage,
      // the only time collectionLocation will be a string is during tsv upload
      // where collectionLocation can be "DELETE" (when a user wants to clear a value)
      if (collectionLocation && typeof collectionLocation !== "string") {
        return collectionLocation.id;
      }
    };

    const samplePayload = {
      pathogen_genome: {
        sequence,
        [METADATA_KEYS_TO_API_KEYS.sequencingDate]: sequencingDate,
      },
      sample: {
        [METADATA_KEYS_TO_API_KEYS.collectionDate]: collectionDate,
        [METADATA_KEYS_TO_API_KEYS.collectionLocation]: collectionLocationId(),
        [METADATA_KEYS_TO_API_KEYS.keepPrivate]: keepPrivate,
        [METADATA_KEYS_TO_API_KEYS.privateId]: privateId,
        [METADATA_KEYS_TO_API_KEYS.publicId]: publicId,
      },
    };

    payload.push(samplePayload);
  }

  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.SAMPLES),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );

  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useCreateSamples({
  componentOnSuccess,
}: {
  componentOnSuccess: () => void;
}): UseMutationResult<unknown, unknown, SampleCreateRequestType, unknown> {
  return useMutation(createSamples, {
    onSuccess: componentOnSuccess,
  });
}

/**
 * sample cache
 */

export const USE_SAMPLE_INFO = {
  entities: [ENTITIES.SAMPLE_INFO],
  id: "sampleInfo",
};

export function useSampleInfo(): UseQueryResult<SampleResponse, unknown> {
  return useQuery([USE_SAMPLE_INFO], () => fetchSamples(), {
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

  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.SAMPLES),
    {
      ...DEFAULT_DELETE_OPTIONS,
      body: JSON.stringify(payload),
    }
  );

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

/**
 * edit samples
 */

interface SamplesEditPayloadType {
  id: number;
  private_identifier?: string;
  public_identifier?: string | null;
  private?: boolean;
  collection_location?: number;
  sequencing_date?: string | null;
  collection_date?: string;
}

interface SamplesEditRequestType {
  samples: SamplesEditPayloadType[];
}

interface GisaidResponseType {
  gisaid_id: string;
  status: string;
}

interface SubmittingGroupResponseType {
  id: number;
  name: string;
}
interface SampleUserResponeType {
  id: number;
  name: string;
}
interface SamplesEditResponseType {
  id: string;
  collection_date: string;
  collection_location: string;
  czb_failed_genome_recovery: boolean;
  gisaid: GisaidResponseType;
  lineage: Lineage;
  private: boolean;
  private_identifier: string;
  public_identifier: string;
  sequencing_date: string;
  submitting_group: SubmittingGroupResponseType;
  updloaded_by: SampleUserResponeType;
  upload_date: string;
}

type SamplesEditCallbacks = MutationCallbacks<SamplesEditResponseType[]>;

export async function editSamples({
  samples,
}: SamplesEditRequestType): Promise<SamplesEditResponseType[]> {
  return putBackendApiJson(
    generateOrgSpecificUrl(ORG_API.SAMPLES),
    JSON.stringify({ samples })
  );
}

export function useEditSamples({
  componentOnError,
  componentOnSuccess,
}: SamplesEditCallbacks): UseMutationResult<
  SamplesEditResponseType[],
  unknown,
  SamplesEditRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  return useMutation(editSamples, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_SAMPLE_INFO]);
      componentOnSuccess(data);
    },
  });
}
