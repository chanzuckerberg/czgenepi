// refactor as needed
import axios from "axios";

import { jsonToType } from "common/utils";

/** Generic functions to interface with the backend API **/
/* eslint-disable @typescript-eslint/no-explicit-any */
async function apiResponse<T extends any[]>(
    keys: string[],
    mappings: (Map<string, string | number> | null)[],
    endpoint: string
): Promise<T> {
    const response = await axios.get(endpoint);
    return keys.map((key, index) => {
        const typeData = response.data[key];
        if (typeData instanceof Array) {
            return typeData.map((entry: Record<string, JSONPrimitive>) =>
                jsonToType(entry, mappings[index])
            );
        }
        return jsonToType(typeData, mappings[index]);
    }) as T;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

/** Calls to specific API endpoints **/

const USER_MAP = new Map<string, keyof User>([
    ["auth0_user_id", "auth0UserId"],
    ["group_admin", "groupAdmin"],
    ["system_admin", "systemAdmin"],
]);
export const fetchUserData = (): Promise<[Group, User]> =>
    apiResponse<[Group, User]>(
        ["group", "user"],
        [null, USER_MAP],
        "/api/usergroup"
    );

const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateId"],
    ["public_identifier", "publicId"],
    ["upload_date", "uploadDate"],
]);
export const fetchSamples = (): Promise<Sample[]> =>
    apiResponse<[Sample[]]>(["samples"], [SAMPLE_MAP], "/api/samples").then(arr => arr.flat());

const TREE_MAP = new Map<string, keyof Tree>([
    ["phylo_tree_id", "id"],
    ["pathogen_genome_count", "pathogenGenomeCount"],
    ["completed_date", "dateCompleted"],
]);
export const fetchTrees = (): Promise<Tree[]> =>
    apiResponse<[Tree[]]>(["phylo_trees"], [TREE_MAP], "/api/phylo_trees").then(arr => arr.flat());
