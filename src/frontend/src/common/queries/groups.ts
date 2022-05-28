import { useQuery, UseQueryResult } from "react-query";
import { API, DEFAULT_FETCH_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";
import { mapUserData, RawUserRequest, USE_USER_INFO } from "./auth";
import { ENTITIES } from "./entities";

export const USE_GROUP_INFO = {
  entities: [ENTITIES.GROUP_INFO],
  id: "groupInfo",
};

export function useGroupMembersInfo(
  currentUserInfo: RawUserRequest
): UseQueryResult<GroupResponse, unknown> {
  return useQuery(
    [USE_GROUP_INFO, USE_USER_INFO],
    () => fetchGroupMembers({ currentUserInfo }),
    {
      retry: false,
      select: (data) => {
        const { members } = data;
        return members.map((m) => mapUserData(m));
      },
    }
  );
}

interface GroupFetchResponseType {
  members: User[];
}

export async function fetchGroupMembers({
  currentUserInfo,
}: {
  currentUserInfo: RawUserRequest;
}): Promise<GroupFetchResponseType> {
  const { group: userGroup } = currentUserInfo ?? {};
  const { id } = userGroup ?? {};

  if (!id) return;

  const response = await fetch(API_URL + API.GROUPS + id + "/members", {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}
