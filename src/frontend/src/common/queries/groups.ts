import { useQuery, UseQueryResult } from "react-query";
import { API, DEFAULT_FETCH_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";
import { mapUserData } from "./auth";
import { ENTITIES } from "./entities";

const mapGroupData = (obj: tmp): Group => {
  return {
    address: obj.address,
    id: obj.id,
    location: obj.default_tree_location,
    name: obj.name,
    prefix: obj.prefix,
  };
};

/**
 * fetch group info
 */
export const USE_GROUP_INFO = {
  entities: [ENTITIES.USE_GROUP_INFO],
  id: "groupInfo",
};

export function useGroupInfo(groupId: number): UseQueryResult<tmp, unknown> {
  return useQuery([USE_GROUP_INFO], () => fetchGroup({ groupId }), {
    retry: false,
    select: mapGroupData,
  });
}

interface GroupFetchResponseType {
  // members: User[];
}

export async function fetchGroup({
  groupId,
}: {
  groupId: number;
}): Promise<GroupFetchResponseType> {
  const response = await fetch(API_URL + API.GROUPS + groupId, {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

/**
 * fetch group members
 */
export const USE_GROUP_MEMBER_INFO = {
  entities: [ENTITIES.USE_GROUP_MEMBER_INFO],
  id: "groupMemberInfo",
};

export function useGroupMembersInfo(
  groupId: number
): UseQueryResult<tmp, unknown> {
  return useQuery(
    [USE_GROUP_MEMBER_INFO],
    () => fetchGroupMembers({ groupId }),
    {
      retry: false,
      select: (data) => {
        const { members } = data;
        return members.map((m) => mapUserData(m));
      },
    }
  );
}

interface GroupMembersFetchResponseType {
  members: User[];
}

export async function fetchGroupMembers({
  groupId,
}: {
  groupId: number;
}): Promise<GroupMembersFetchResponseType> {
  const response = await fetch(API_URL + API.GROUPS + groupId + "/members", {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}
