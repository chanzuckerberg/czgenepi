import ENV from "src/common/constants/ENV";
import { jsonToType } from "src/common/utils";
import { store } from "../redux";
import { selectCurrentGroup, selectCurrentPathogen } from "../redux/selectors";

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
 * First chunk of things -- `API_KEY_TO_TYPE`, `convert`, and `apiResponse` --
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

const API_KEY_TO_TYPE: Record<string, string> = {
  group: "Group",
  phylo_trees: "Tree",
  samples: "Sample",
  user: "User",
};

function convert<U extends APIResponse, T extends U[keyof U]>(
  entry: Record<string, JSONPrimitive>,
  keyMap: Map<string, string | number> | null,
  key: keyof U,
  keySubMap?: Map<string, Map<string, string>>
): T {
  const converted = jsonToType<T>(entry, keyMap);
  // key should always be a string anyways. no funky business please.
  converted.type = API_KEY_TO_TYPE[String(key)];
  // ^^^ FIXME (Vince) Does this get used anywhere? What was original purpose?

  // If we end up with deeper nested objects, this could be recursive instead.
  if (keySubMap) {
    const convertedKeys = Object.keys(converted);
    convertedKeys.forEach((convertedKey) => {
      if (keySubMap.has(convertedKey)) {
        converted[convertedKey] = jsonToType<T>(
          converted[convertedKey],
          keySubMap.get(convertedKey) || null
        );
      }
    });
  }
  return converted;
}

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
  keys: (keyof T)[],
  mappings: (Map<string, string | number> | null)[],
  endpoint: string,
  subMappings?: Map<string, Map<string, string>>[]
): Promise<T> {
  const response = await fetch(ENV.API_URL + endpoint, DEFAULT_FETCH_OPTIONS);
  const result = await response.json();
  if (!response.ok) {
    throw result;
  }

  const convertedData = keys.map((key, index) => {
    type keyType = T[typeof key];
    const typeData = result[key];
    const keyMap = mappings[index];
    const keySubMap = subMappings && subMappings[index];
    let resultData: keyType | keyType[];
    if (typeData instanceof Array) {
      resultData = typeData.map((entry: Record<string, JSONPrimitive>) =>
        convert<T, keyType>(entry, keyMap, key, keySubMap)
      );
    } else {
      resultData = convert<T, keyType>(typeData, keyMap, key, keySubMap);
    }
    return [key, resultData];
  });

  return Object.fromEntries(convertedData);
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
const SAMPLE_MAP = new Map<string, keyof Sample>([
  ["collection_date", "collectionDate"],
  ["collection_location", "collectionLocation"],
  ["private_identifier", "privateId"],
  ["public_identifier", "publicId"],
  ["upload_date", "uploadDate"],
  ["uploaded_by", "uploadedBy"],
  ["sequencing_date", "sequencingDate"],
  ["submitting_group", "submittingGroup"],
  ["czb_failed_genome_recovery", "CZBFailedGenomeRecovery"],
  ["qc_metrics", "qcMetrics"],
]);

export const fetchSamples = (): Promise<SampleResponse> =>
  apiResponse<SampleResponse>(
    ["samples"],
    [SAMPLE_MAP],
    generateOrgSpecificUrl(ORG_API.SAMPLES)
  );

export interface PhyloRunResponse extends APIResponse {
  phylo_trees: PhyloRun[];
}
const PHYLO_RUN_MAP = new Map<string, keyof PhyloRun>([
  ["end_datetime", "endDate"],
  ["phylo_tree", "phyloTree"],
  ["start_datetime", "startedDate"],
  ["template_args", "templateArgs"],
  ["tree_type", "treeType"],
  ["workflow_id", "workflowId"],
  ["workflow_status", "status"],
]);

const TEMPLATE_ARGS_MAP = new Map<string, keyof TemplateArgs>([
  ["filter_pango_lineages", "filterPangoLineages"],
  ["filter_start_date", "filterStartDate"],
  ["filter_end_date", "filterEndDate"],
  ["location_id", "locationId"],
]);

const PHYLO_RUN_SUBMAP = new Map<string, Map<string, string>>();
PHYLO_RUN_SUBMAP.set("templateArgs", TEMPLATE_ARGS_MAP);

export const fetchPhyloRuns = (): Promise<PhyloRunResponse> =>
  apiResponse<PhyloRunResponse>(
    ["phylo_runs"],
    [PHYLO_RUN_MAP],
    generateOrgSpecificUrl(ORG_API.PHYLO_RUNS),
    [PHYLO_RUN_SUBMAP]
  );
