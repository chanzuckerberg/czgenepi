import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import {
  API,
  DEFAULT_DELETE_OPTIONS,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_POST_OPTIONS,
  DEFAULT_PUT_OPTIONS,
  fetchTrees,
  TreeResponse,
} from "../api";
import { API_URL } from "../constants/ENV";
import { ENTITIES } from "./entities";
import { MutationCallbacks } from "./types";

/* create trees */

// * these two types should stay in sync. There is technically a way to do it in TS, but it is
// * very convoluted: https://stackoverflow.com/questions/44323441
interface CreateTreePayload {
  name: string;
  samples: string[];
  tree_type: string | undefined; // treeType can be undefined when user first opens the NSTreeCreate modal
}

interface CreateTreeType {
  treeName: string;
  sampleIds: string[];
  treeType: string | undefined;
}

type CreateTreeCallbacks = MutationCallbacks<void>;

async function createTree({
  sampleIds,
  treeName,
  treeType,
}: {
  sampleIds: string[];
  treeName: string;
  treeType: string | undefined;
}): Promise<unknown> {
  const payload: CreateTreePayload = {
    name: treeName,
    samples: sampleIds,
    tree_type: treeType,
  };
  const response = await fetch(API_URL + API.PHYLO_TREES_V2, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useCreateTree({
  componentOnError,
  componentOnSuccess,
}: CreateTreeCallbacks): UseMutationResult<
  unknown,
  unknown,
  CreateTreeType,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation(createTree, {
    onError: componentOnError,
    onSuccess: async () => {
      await queryClient.invalidateQueries([USE_TREE_INFO]);
      componentOnSuccess();
    },
  });
}

/* generate tree url */

// * these two types should stay in sync. There is technically a way to do it in TS, but it is
// * very convoluted: https://stackoverflow.com/questions/44323441
interface FastaURLPayloadType {
  samples: string[];
  downstream_consumer?: string;
}

interface FastaRequestType {
  sampleIds: string[];
  downstreamConsumer?: string;
}

export interface FastaResponseType {
  url: string;
}

type FastaFetchCallbacks = MutationCallbacks<FastaResponseType>;

async function getFastaURL({
  sampleIds,
  downstreamConsumer,
}: FastaRequestType): Promise<FastaResponseType> {
  const payload: FastaURLPayloadType = {
    samples: sampleIds,
    // If specialty downstream consumer, set this to have FASTA generate accordingly
    // If left as undefined, will be stripped out from payload during JSON.stringify
    downstream_consumer: downstreamConsumer,
  };
  const response = await fetch(API_URL + API.GET_FASTA_URL, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useFastaFetch({
  componentOnError,
  componentOnSuccess,
}: FastaFetchCallbacks): UseMutationResult<
  FastaResponseType,
  unknown,
  FastaRequestType,
  unknown
> {
  return useMutation(getFastaURL, {
    onError: componentOnError,
    onSuccess: componentOnSuccess,
  });
}

/* get options for usher tree placement */
export async function getUsherOptions(): Promise<unknown> {
  const response = await fetch(API_URL + API.USHER_TREE_OPTIONS, {
    ...DEFAULT_FETCH_OPTIONS,
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

/* custom hook to automatically expire tree info when needed */
/* such as when trees are deleted */
export const USE_TREE_INFO = {
  entities: [ENTITIES.TREE_INFO],
  id: "treeInfo",
};

export function useTreeInfo(): UseQueryResult<TreeResponse, unknown> {
  return useQuery([USE_TREE_INFO], fetchTrees, {
    retry: false,
  });
}

// * Proceed with caution, you are entering the DANGER ZONE!
// * Code below this line is destructive!

/**
 * delete trees
 */

type TreeDeleteCallbacks = MutationCallbacks<TreeDeleteResponseType>;
interface TreeDeleteRequestType {
  treeIdToDelete: string;
}

interface TreeDeleteResponseType {
  id: string;
}

export async function deleteTree({
  treeIdToDelete,
}: TreeDeleteRequestType): Promise<TreeDeleteResponseType> {
  const response = await fetch(API_URL + API.PHYLO_TREES_V2 + treeIdToDelete, {
    ...DEFAULT_DELETE_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useDeleteTree({
  componentOnError,
  componentOnSuccess,
}: TreeDeleteCallbacks): UseMutationResult<
  TreeDeleteResponseType,
  unknown,
  TreeDeleteRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  return useMutation(deleteTree, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_TREE_INFO]);
      componentOnSuccess(data);
    },
  });
}

/**
 * edit trees
 */

interface EditTreePayloadType {
  name: string;
}

interface TreeEditRequestType {
  treeIdToEdit: string;
  newTreeName: string;
}

interface TreeEditResponseType {
  id: string;
}

type TreeEditCallbacks = MutationCallbacks<TreeEditResponseType>;

export async function editTree({
  treeIdToEdit,
  newTreeName,
}: TreeEditRequestType): Promise<TreeEditResponseType> {
  const payload: EditTreePayloadType = {
    name: newTreeName,
  };
  const response = await fetch(API_URL + API.PHYLO_TREES_V2 + treeIdToEdit, {
    ...DEFAULT_PUT_OPTIONS,
    body: JSON.stringify(payload),
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useEditTree({
  componentOnError,
  componentOnSuccess,
}: TreeEditCallbacks): UseMutationResult<
  TreeEditResponseType,
  unknown,
  TreeEditRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  return useMutation(editTree, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_TREE_INFO]);
      componentOnSuccess(data);
    },
  });
}
