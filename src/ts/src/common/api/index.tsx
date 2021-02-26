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
    const response = await axios.get("/api/usergroup");
    const group = response.data.group as Group;
    const user = jsonToType<User>(response.data.user, USER_MAP);
    return { group, user };
};

const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateID"],
    ["public_identifier", "publicID"],
    ["upload_date", "uploadDate"],
]);
export const fetchSamples = async (): Promise<Array<Sample>> => {
    const response = await axios.get("/api/samples");
    const samples: Array<Sample> = response.data.map(
        (entry: Record<string, string>) => jsonToType<Sample>(entry, SAMPLE_MAP)
    );
    return samples;
};
