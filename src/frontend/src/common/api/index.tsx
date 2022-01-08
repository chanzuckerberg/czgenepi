import ENV from "src/common/constants/ENV";
import { jsonToType } from "src/common/utils";

export enum API {
  USER_INFO = "/api/usergroup",
  SAMPLES = "/v2/samples/",
  LOG_IN = "/login",
  LOG_OUT = "/logout",
  SAMPLES_CREATE = "/api/samples/create",
  SAMPLES_FASTA_DOWNLOAD = "/api/sequences",
  PHYLO_TREES = "/v2/phylo_runs/",
  GET_FASTA_URL = "/api/sequences/getfastaurl",
  USHER_TREE_OPTIONS = "/api/usher/tree_options",
  SAMPLES_VALIDATE_IDS = "/api/samples/validate-ids",
  LOCATIONS = "/v2/locations/",
}

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

/** Generic functions to interface with the backend API **/

const API_KEY_TO_TYPE: Record<string, string> = {
  group: "Group",
  phylo_runs: "Tree",
  samples: "Sample",
  user: "User",
};

function convert<U extends APIResponse, T extends U[keyof U]>(
  entry: Record<string, JSONPrimitive>,
  keyMap: Map<string, string | number> | null,
  key: keyof U
): T {
  const converted = jsonToType<T>(entry, keyMap);
  // key should always be a string anyways. no funky business please.
  converted.type = API_KEY_TO_TYPE[String(key)];

  return converted;
}

export async function apiResponse<T extends APIResponse>(
  keys: (keyof T)[],
  mappings: (Map<string, string | number> | null)[],
  endpoint: string
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
    let resultData: keyType | keyType[];
    if (typeData instanceof Array) {
      resultData = typeData.map((entry: Record<string, JSONPrimitive>) =>
        convert<T, keyType>(entry, keyMap, key)
      );
    } else {
      resultData = convert<T, keyType>(typeData, keyMap, key);
    }
    return [key, resultData];
  });

  return Object.fromEntries(convertedData);
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
]);

export const fetchSamples = (): Promise<SampleResponse> =>
  apiResponse<SampleResponse>(["samples"], [SAMPLE_MAP], API.SAMPLES);

export interface TreeResponse extends APIResponse {
  phylo_runs: Tree[];
}
const TREE_MAP = new Map<string, keyof Tree>([
  ["end_datetime", "creationDate"],
  ["tree_type", "treeType"],
  ["start_datetime", "startedDate"],
  ["workflow_status", "status"],
]);
export const fetchTrees = (): Promise<TreeResponse> =>
  apiResponse<TreeResponse>(["phylo_runs"], [TREE_MAP], API.PHYLO_TREES);
