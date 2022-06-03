import { useQuery, UseQueryResult } from "react-query";
import { API, DEFAULT_FETCH_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";
import { mapUserData, RawUserRequest } from "./auth";
import { ENTITIES } from "./entities";

export interface RawGroupRequest {
  address: string;
  id: number;
  default_tree_location: GisaidLocation;
  name: string;
  prefix: string;
}

export const mapGroupData = (obj: RawGroupRequest): Group => {
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
  entities: [ENTITIES.GROUP_INFO],
  id: "groupInfo",
};

export function useGroupInfo(groupId?: number): UseQueryResult<Group, unknown> {
  return useQuery([USE_GROUP_INFO], () => fetchGroup({ groupId }), {
    retry: false,
    select: mapGroupData,
  });
}

export async function fetchGroup({
  groupId,
}: {
  groupId?: number;
}): Promise<RawGroupRequest> {
  const response = await fetch(API_URL + API.GROUPS + groupId, {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

/**
 * fetch group members
 */

interface GroupMembersFetchResponseType {
  members: RawUserRequest[];
}

export const USE_GROUP_MEMBER_INFO = {
  entities: [ENTITIES.GROUP_MEMBER_INFO],
  id: "groupMemberInfo",
};

export function useGroupMembersInfo(
  groupId?: number
): UseQueryResult<User[], unknown> {
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

export async function fetchGroupMembers({
  groupId,
}: {
  groupId?: number;
}): Promise<GroupMembersFetchResponseType> {
  const response = await fetch(API_URL + API.GROUPS + groupId + "/members", {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}
