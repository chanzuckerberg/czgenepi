import ENV from "src/common/constants/ENV";
import { store } from "../redux";
import { selectCurrentGroup, selectCurrentPathogen } from "../redux/selectors";
import { camelize } from "../utils/dataTransforms";

export enum API {
  USERDATA = "/v2/users/me",
  LOG_IN = "/v2/auth/login",
  LOG_OUT = "/v2/auth/logout",
  LOCATIONS = "/v2/locations/",
  PANGO_LINEAGES = "/v2/lineages/pango",
  GROUPS = "/v2/groups/",
  ORGS = "/v2/orgs/",
}

export enum ORG_API {
  AUSPICE = "auspice/generate",
  PHYLO_RUNS = "phylo_runs/",
  PHYLO_TREES = "phylo_trees/",
  SAMPLES = "samples/",
  SAMPLES_VALIDATE_IDS = "samples/validate_ids/",
  SAMPLES_FASTA_DOWNLOAD = "sequences/",
  SAMPLES_TEMPLATE_DOWNLOAD = "samples/submission_template",
  SAMPLES_NEXTCLADE_DOWNLOAD = "qc_mutations/",
  GET_FASTA_URL = "sequences/getfastaurl",
  USHER_TREE_OPTIONS = "usher/tree_versions/",
}

export const generateOrgSpecificUrl = (path: ORG_API): string => {
  const state = store.getState();
  const groupId = selectCurrentGroup(state);
  const pathogen = selectCurrentPathogen(state);

  return `${API.ORGS}${groupId}/pathogens/${pathogen}/${path}`;
};

export const generateGroupSpecificUrl = (path: string): string => {
  const groupId = selectCurrentGroup(store.getState());
  return `${API.GROUPS}${groupId}/${path}`;
};

export const DEFAULT_HEADERS_MUTATION_OPTIONS: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
};

export const DEFAULT_PUT_OPTIONS: RequestInit = {
  credentials: "include",
  method: "PUT",
  ...DEFAULT_HEADERS_MUTATION_OPTIONS,
};

export const DEFAULT_POST_OPTIONS: RequestInit = {
  credentials: "include",
  method: "POST",
  ...DEFAULT_HEADERS_MUTATION_OPTIONS,
};

export const DEFAULT_DELETE_OPTIONS: RequestInit = {
  credentials: "include",
  method: "DELETE",
  ...DEFAULT_HEADERS_MUTATION_OPTIONS,
};

/**
 * Generic functions to interface with the backend API
 *
 * First chunk of things -- `apiResponse` --
 * are intended for "heavier" GETs to the backend that require some level
 * of data conversion for the response we get. For example, the samples
 * endpoint returns a bunch of stuff in snake_case, but we want camelCase,
 * so in addition to fetching the data, it also handles all those conversions
 * before returning the parsed response.
 *
 * The second chunk of things -- `makeBackendApiJsonCall` and associated
 * convenience funcs -- are for less "heavy" calls and/or those that where
 * the response is used more directly. They are a very thin wrapper around
 * the browser `fetch` API. Mostly for convenience and standardization.
 *
 * There is not a clear line between when a request should be using one
 * or the other. If you have a GET call that needs light parsing of the
 * response, either would make sense, use your best judgment.
 **/

/**
 * Make a GET request to backend API, parse results based on provided mapping.
 *
 * Args:
 *   keys: array of top-level keys to extract from JSON response
 *   mappings: array of next-level-down key mappings to convert with
 *     NOTE -- keys and mappings need to be same length and matching orders
 *   endpoint: backend route request is sent to
 *
 * Returns:
 *   obj: top-level keys match arg `keys`, values converted via its mapping
 */

export async function apiResponse<T extends APIResponse>(
  endpoint: string
): Promise<T> {
  const response = await fetch(ENV.API_URL + endpoint, DEFAULT_FETCH_OPTIONS);
  const apiData = await response.json();
  if (!response.ok) {
    throw apiData;
  }

  return camelize(apiData);
}

/**
 * Make request to backend that should receive a JSON response.
 *
 * This and the functions using it below exist mostly as a convenience method
 * and to help keep our interactions with the backend API standardized.
 *
 * TODO make convenience helpers for each flavor of HTTP request and start
 * using them to make API calls instead of individual but similar `fetch`
 * calls forming the basis of our API calls. Eventually migrate moving existing
 * queries to using the convenience helpers instead.
 */
export async function makeBackendApiJsonCall<T>(
  route: string,
  requestOptions: RequestInit
): Promise<T> {
  const response = await fetch(ENV.API_URL + route, {
    ...requestOptions,
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

// GET convenience function -- DEFAULT_FETCH_OPTIONS if only `route`
export async function getBackendApiJson<T>(
  route: string,
  additionalRequestOptions: RequestInit = {}
): Promise<T> {
  const requestOptions = {
    ...DEFAULT_FETCH_OPTIONS,
    ...additionalRequestOptions,
  };
  return await makeBackendApiJsonCall(route, requestOptions);
}

export async function putBackendApiJson<T>(
  route: string,
  requestBody: string,
  additionalRequestOptions: RequestInit = {}
): Promise<T> {
  const requestOptions = {
    ...DEFAULT_PUT_OPTIONS,
    ...additionalRequestOptions,
    body: requestBody,
  };
  return await makeBackendApiJsonCall(route, requestOptions);
}

/** Calls to specific API endpoints **/

export interface SampleResponse extends APIResponse {
  samples: Sample[];
}

export const fetchSamples = (): Promise<SampleResponse> =>
  apiResponse<SampleResponse>(generateOrgSpecificUrl(ORG_API.SAMPLES));

export interface PhyloRunResponse extends APIResponse {
  phylo_trees: PhyloRun[];
}

export const fetchPhyloRuns = (): Promise<PhyloRunResponse> =>
  apiResponse<PhyloRunResponse>(generateOrgSpecificUrl(ORG_API.PHYLO_RUNS));
