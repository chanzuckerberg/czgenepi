// refactor as needed
import axios from "axios";

import { jsonToType } from "common/utils";

const USER_MAP = new Map<string, keyof User>([
    ["auth0_user_id", "auth0UserId"],
    ["group_admin", "groupAdmin"],
    ["system_admin", "systemAdmin"],
]);
export const fetchUserData = async (): Promise<
    Record<string, Group | User>
> => {
    const response = await axios.get(process.env.API_URL + "/api/usergroup");
    const group = response.data.group as Group;
    const user = jsonToType<User>(response.data.user, USER_MAP);
    return { group, user };
};

const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateId"],
    ["public_identifier", "publicId"],
    ["upload_date", "uploadDate"],
]);
export const fetchSamples = async (): Promise<Array<Sample>> => {
    const response = await axios.get("/api/samples");
    const samples: Array<Sample> = response.data.map(
        (entry: Record<string, string>) => jsonToType<Sample>(entry, SAMPLE_MAP)
    );
    return samples;
};

const TREE_MAP = new Map<string, keyof Tree>([
    ["phylo_tree_id", "id"],
    ["pathogen_genome_count", "pathogenGenomeCount"],
    ["completed_date", "dateCompleted"],
]);
export const fetchTrees = async (): Promise<Array<Tree>> => {
    const response = await axios.get("/api/phylo_trees");
    const trees: Array<Tree> = response.data.map(
        (entry: Record<string, string | number>) =>
            jsonToType<Tree>(entry, TREE_MAP)
    );
    return trees;
};
