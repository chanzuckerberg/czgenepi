// refactor as needed
import axios from "axios";

const USER_MAP = new Map<string, keyof User>([
    ["auth0_user_id", "auth0UserId"],
    ["group_admin", "groupAdmin"],
    ["system_admin", "systemAdmin"]
])
export const fetchUserData = async () => {
    const response = await axios.get("/api/usergroup");
    const group: Group = response.data.group as Group
    const user: User = Object.fromEntries(
        Object.keys(response.data.user).map(key => {
            return [USER_MAP.get(key), response.data.user[key]]
        })
    )
    return { group, user }
};

const SAMPLE_MAP = new Map<string, keyof Sample>([
    ["collection_date", "collectionDate"],
    ["collection_location", "collectionLocation"],
    ["private_identifier", "privateID"],
    ["public_identifier", "publicID"],
    ["upload_date", "uploadDate"]
])
export const fetchSamples = async () => {
    const response = await axios.get("/api/samples");
    const samples: Array<Sample> = response.data.map((entry: Record<string, any>) => Object.fromEntries(
            Object.keys(entry).map(key => {
                return [SAMPLE_MAP.get(key), entry[key]]
            })
        )
    )
    return samples;
}
