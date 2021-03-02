// refactor as needed
import axios from "axios";

import { jsonToType } from "common/utils";

async function apiSingleResponse<T>(mapping: Map<string, keyof T>, endpoint: string): Promise<T> {
    const response = await axios.get(endpoint);
    const singleType = jsonToType<T>(response.data, mapping)
    return singleType;
}

async function apiSplitResponse<T extends any[]>(mappings: Array<Map<string, any>>, endpoint: string): Promise<T> {
    const response = await axios.get(endpoint);
    const splitTypeArray = Object.keys(response.data).map(
        (key: string, index: number) => jsonToType(response.data[key], mappings[index])
    ) as T // this array maps to the tuple type T (e.g. [K, U])
    return splitTypeArray
}

async function apiCollectionResponse<T>(mapping: Map<string, keyof T>, endpoint: string): Promise<Array<T>> {
    const response = await axios.get(endpoint);
    const collectionType: Array<T> = response.data.map(
        (entry: Record<string, JSONPrimitive>) => jsonToType<T>(entry, mapping)
    );
    return collectionType;
}

const USER_MAP = new Map<string, keyof User>([
    ["auth0_user_id", "auth0UserId"],
    ["group_admin", "groupAdmin"],
    ["system_admin", "systemAdmin"],
]);
export const fetchUserData = async () => apiSplitResponse<[Group, User]>([new Map([]), USER_MAP], "/api/usergroup")

const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateId"],
    ["public_identifier", "publicId"],
    ["upload_date", "uploadDate"],
]);
export const fetchSamples = async () => apiCollectionResponse<Sample>(SAMPLE_MAP, "/api/samples")

const TREE_MAP = new Map<string, keyof Tree>([
    ["phylo_tree_id", "id"],
    ["pathogen_genome_count", "pathogenGenomeCount"],
    ["completed_date", "dateCompleted"],
]);
export const fetchTrees = async () => apiCollectionResponse<Tree>(TREE_MAP, "/api/phylo_trees")
