import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import {
  API,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_POST_OPTIONS,
  fetchTrees,
  TreeResponse,
} from "../api";
import { API_URL } from "../constants/ENV";
import { ENTITIES } from "./entities";

interface CreateTreePayload {
  name: string;
  samples: string[];
  tree_type: string;
}

interface getFastaURLPayload {
  samples: string[];
}

// * these two types should stay in sync. There is technically a way to do it in TS, but it is
// * very convoluted: https://stackoverflow.com/questions/44323441
interface CreateTreeType {
  treeName: string;
  sampleIds: string[];
  treeType: string;
}

export const USE_TREE_INFO = {
  entities: [ENTITIES.TREE_INFO],
  id: "treeInfo",
};

export async function createTree({
  sampleIds,
  treeName,
  treeType,
}: {
  sampleIds: string[];
  treeName: string;
  treeType: string;
}): Promise<unknown> {
  const payload: CreateTreePayload = {
    name: treeName,
    samples: sampleIds,
    tree_type: treeType,
  };
  const response = await fetch(API_URL + API.CREATE_TREE, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export async function getFastaURL({
  sampleIds,
}: {
  sampleIds: string[];
}): Promise<unknown> {
  const payload: getFastaURLPayload = {
    samples: sampleIds,
  };
  const response = await fetch(API_URL + API.GET_FASTA_URL, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export async function getUsherOptions(): Promise<unknown> {
  const response = await fetch(API_URL + API.USHER_TREE_OPTIONS, {
    ...DEFAULT_FETCH_OPTIONS,
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

interface CreateTreeCallbacks {
  onError: () => void;
  onSuccess: () => void;
}

export function useCreateTree({
  onError,
  onSuccess,
}: CreateTreeCallbacks): UseMutationResult<
  unknown,
  unknown,
  CreateTreeType,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation(createTree, {
    onError,
    onSuccess: async () => {
      await queryClient.invalidateQueries([USE_TREE_INFO]);
      onSuccess();
    },
  });
}

export function useTreeInfo(): UseQueryResult<TreeResponse, unknown> {
  return useQuery([USE_TREE_INFO], fetchTrees, {
    retry: false,
  });
}
