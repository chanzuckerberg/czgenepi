import { useMutation, UseMutationResult, useQueryClient } from "react-query";
import {
  API,
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_HEADERS_MUTATION_OPTIONS,
  DEFAULT_POST_OPTIONS,
  DEFAULT_PUT_OPTIONS,
  generateOrgSpecificUrl,
  ORG_API,
} from "../api";
import { API_URL } from "../constants/ENV";
import { USE_PHYLO_RUN_INFO } from "./phyloRuns";
import { MutationCallbacks } from "./types";

/* create trees */

// * these two types should stay in sync. There is technically a way to do it in TS, but it is
// * very convoluted: https://stackoverflow.com/questions/44323441
interface CreateTreePayload {
  name: string;
  samples: string[];
  tree_type: string | undefined; // treeType can be undefined when user first opens the NSTreeCreate modal
  template_args?: {
    filter_start_date?: string;
    filter_end_date?: string;
    filter_pango_lineages?: string[];
  };
}

interface CreateTreeType {
  treeName: string;
  sampleIds: string[];
  treeType: string | undefined;
  filters: {
    startDate?: FormattedDateType;
    endDate?: FormattedDateType;
    lineages?: string[];
  };
}

type CreateTreeCallbacks = MutationCallbacks<void>;

async function createTree({
  sampleIds,
  treeName,
  treeType,
  filters,
}: CreateTreeType): Promise<unknown> {
  const { startDate, endDate, lineages } = filters;
  const payload: CreateTreePayload = {
    name: treeName,
    samples: sampleIds,
    tree_type: treeType,
    template_args: {
      filter_start_date: startDate,
      filter_end_date: endDate,
      filter_pango_lineages: lineages,
    },
  };

  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.PHYLO_RUNS),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );
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
      await queryClient.invalidateQueries([USE_PHYLO_RUN_INFO]);
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

  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.GET_FASTA_URL),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );
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

/**
 * edit trees
 */

interface EditTreePayloadType {
  name: string;
}

interface TreeEditRequestType {
  treeIdToEdit: number;
  newTreeName: string;
}

interface TreeEditResponseType {
  id: number;
}

type TreeEditCallbacks = MutationCallbacks<TreeEditResponseType>;

export async function editTree({
  treeIdToEdit,
  newTreeName,
}: TreeEditRequestType): Promise<TreeEditResponseType> {
  const payload: EditTreePayloadType = {
    name: newTreeName,
  };
  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.PHYLO_RUNS) + treeIdToEdit,
    {
      ...DEFAULT_PUT_OPTIONS,
      ...DEFAULT_HEADERS_MUTATION_OPTIONS,
      body: JSON.stringify(payload),
    }
  );

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
      await queryClient.invalidateQueries([USE_PHYLO_RUN_INFO]);
      componentOnSuccess(data);
    },
  });
}
