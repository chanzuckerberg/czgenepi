import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  DEFAULT_DELETE_OPTIONS,
  fetchPhyloRuns,
  generateOrgSpecificUrl,
  ORG_API,
  PhyloRunResponse,
} from "../api";
import { API_URL } from "../constants/ENV";
import {
  getDownloadLinks,
  getTreeType,
  IdMap,
  reduceObjectArrayToLookupDict,
} from "../utils/dataTransforms";
import { ENTITIES } from "./entities";
import { MutationCallbacks } from "./types";

/* custom hook to automatically expire tree info when needed */
/* such as when trees are deleted */
const mapPhyloRuns = (data: PhyloRunResponse) => {
  const phyloRuns = data.phylo_runs;

  const transformedRuns = phyloRuns.map((p: PhyloRun) => ({
    ...p,
    ...getDownloadLinks(p),
    treeType: getTreeType(p),
  }));

  return reduceObjectArrayToLookupDict<PhyloRun>(transformedRuns, "id");
};

export const USE_PHYLO_RUN_INFO = {
  entities: [ENTITIES.PHYLO_RUN_INFO],
  id: "phyloRunInfo",
};

export function usePhyloRunInfo(): UseQueryResult<IdMap<PhyloRun>, unknown> {
  return useQuery([USE_PHYLO_RUN_INFO], fetchPhyloRuns, {
    retry: false,
    select: mapPhyloRuns,
  });
}

// * Proceed with caution, you are entering the DANGER ZONE!
// * Code below this line is destructive!

/**
 * delete trees
 */

type PhyloRunDeleteCallbacks = MutationCallbacks<PhyloRunDeleteResponseType>;
interface PhyloRunDeleteRequestType {
  phyloRunIdToDelete: number;
}

interface PhyloRunDeleteResponseType {
  id: string;
}

async function deletePhyloRun({
  phyloRunIdToDelete,
}: PhyloRunDeleteRequestType): Promise<PhyloRunDeleteResponseType> {
  const response = await fetch(
    API_URL + generateOrgSpecificUrl(ORG_API.PHYLO_RUNS) + phyloRunIdToDelete,
    {
      ...DEFAULT_DELETE_OPTIONS,
    }
  );

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useDeletePhyloRun({
  componentOnError,
  componentOnSuccess,
}: PhyloRunDeleteCallbacks): UseMutationResult<
  PhyloRunDeleteResponseType,
  unknown,
  PhyloRunDeleteRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  return useMutation(deletePhyloRun, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_PHYLO_RUN_INFO]);
      componentOnSuccess(data);
    },
  });
}
