// refactor as needed
import axios from "axios";

import { jsonToType } from "common/utils";

/** Generic functions to interface with the backend API **/
/* eslint-disable @typescript-eslint/no-explicit-any */

async function apiResponse<T extends APIResponse>(
    keys: (keyof T)[],
    mappings: (Map<string, string | number> | null)[],
    endpoint: string
): Promise<T> {
    const response = await axios.get(endpoint);
    const convertedData = keys.map((key, index) => {
        type keyType = T[typeof key];
        const typeData = response.data[key];
        const keyMap = mappings[index];
        let resultData:
            | Record<string, JSONPrimitive>
            | Array<Record<string, JSONPrimitive>> = {};
        if (typeData instanceof Array) {
            resultData = typeData.map((entry: Record<string, JSONPrimitive>) =>
                jsonToType<keyType>(entry, keyMap)
            );
        } else {
            resultData = jsonToType<keyType>(typeData, keyMap);
        }
        return [key, resultData];
    });
    const result: T = Object.fromEntries(convertedData);
    return result;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

/** Calls to specific API endpoints **/

interface UserResponse extends APIResponse {
    group: Group;
    user: User;
}
const USER_MAP = new Map<string, keyof User>([
    ["auth0_user_id", "auth0UserId"],
    ["group_admin", "groupAdmin"],
    ["system_admin", "systemAdmin"],
]);
export const fetchUserData = (): Promise<UserResponse> =>
    apiResponse<UserResponse>(
        ["group", "user"],
        [null, USER_MAP],
        "/api/usergroup"
    );

interface SampleResponse extends APIResponse {
    samples: Sample[];
}
const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateId"],
    ["public_identifier", "publicId"],
    ["upload_date", "uploadDate"],
]);
export const fetchSamples = (): Promise<SampleResponse> =>
    apiResponse<SampleResponse>(["samples"], [SAMPLE_MAP], "/api/samples");

interface TreeResponse extends APIResponse {
    phylo_trees: Tree[];
}
const TREE_MAP = new Map<string, keyof Tree>([
    ["phylo_tree_id", "id"],
    ["pathogen_genome_count", "pathogenGenomeCount"],
    ["completed_date", "dateCompleted"],
]);
export const fetchTrees = (): Promise<TreeResponse> =>
    apiResponse<TreeResponse>(["phylo_trees"], [TREE_MAP], "/api/phylo_trees");
