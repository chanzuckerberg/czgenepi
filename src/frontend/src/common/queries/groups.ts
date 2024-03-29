import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { forEach } from "lodash";
import { queryClient } from "src/common/queries/queryClient";
import {
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_POST_OPTIONS,
  generateGroupSpecificUrl,
} from "../api";
import { API_URL } from "../constants/ENV";
import { camelize } from "../utils/dataTransforms";
import { ENTITIES } from "./entities";
import { USE_PHYLO_RUN_INFO } from "./phyloRuns";
import { USE_SAMPLE_INFO } from "./samples";
import { MutationCallbacks } from "./types";

export interface RawGroupRequest {
  address: string;
  id: number;
  default_tree_location: GisaidLocation;
  name: string;
  prefix: string;
}

interface RawInvitationResponse {
  created_at: string;
  expires_at: string;
  id: string;
  invitee: { email: string };
  inviter: { name: string };
}

export interface RawGroupMemberRequest {
  id: number;
  name: string;
  agreed_to_tos: boolean;
  acknowledged_policy_version: string | null;
  email: string;
  created_at: string;
  role: GroupRole;
}

export const mapGroupData = (obj: RawGroupRequest): GroupDetails => {
  return {
    address: obj.address,
    id: obj.id,
    location: obj.default_tree_location,
    name: obj.name,
    prefix: obj.prefix,
  };
};

/**
 * starting all group-related queries with "group" allows us to invalidate
 * all of the queries in a single call to queryClient.invalidateQueries(["group"])
 */
export const GROUP_QUERY_ID_PREFIX = "group";

/**
 * fetch group info
 */
export const USE_GROUP_INFO = {
  entities: [ENTITIES.GROUP_INFO],
  id: `${GROUP_QUERY_ID_PREFIX}Info`,
};

export function useGroupInfo(): UseQueryResult<GroupDetails, unknown> {
  return useQuery([USE_GROUP_INFO], () => fetchGroup(), {
    retry: false,
    select: mapGroupData,
  });
}

export async function fetchGroup(): Promise<RawGroupRequest> {
  const response = await fetch(API_URL + generateGroupSpecificUrl(""), {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

/**
 * fetch group members
 */

interface GroupMembersFetchResponseType {
  members: RawGroupMemberRequest[];
}

export const USE_GROUP_MEMBER_INFO = {
  entities: [ENTITIES.GROUP_MEMBER_INFO],
  id: `${GROUP_QUERY_ID_PREFIX}MemberInfo`,
};

export function useGroupMembersInfo(): UseQueryResult<GroupMember[], unknown> {
  return useQuery([USE_GROUP_MEMBER_INFO], fetchGroupMembers, {
    retry: false,
    select: (data) => {
      const { members } = data;
      return members.map(camelize);
    },
  });
}

export async function fetchGroupMembers(): Promise<GroupMembersFetchResponseType> {
  const response = await fetch(API_URL + generateGroupSpecificUrl("members/"), {
    ...DEFAULT_FETCH_OPTIONS,
  });

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

/**
 * fetch group invitations
 */

interface FetchInvitationResponseType {
  invitations: RawInvitationResponse[];
}

export const USE_GROUP_INVITATION_INFO = {
  entities: [ENTITIES.GROUP_INVITATION_INFO],
  id: `${GROUP_QUERY_ID_PREFIX}InvitationInfo`,
};

export function useGroupInvitations(): UseQueryResult<Invitation[], unknown> {
  return useQuery([USE_GROUP_INVITATION_INFO], fetchGroupInvitations, {
    retry: false,
    select: (data) => {
      const { invitations } = data;
      return invitations.map(camelize);
    },
  });
}

export async function fetchGroupInvitations(): Promise<FetchInvitationResponseType> {
  const response = await fetch(
    API_URL + generateGroupSpecificUrl("invitations/"),
    {
      ...DEFAULT_FETCH_OPTIONS,
    }
  );

  if (response.ok) return await response.json();
  throw Error(`${response.statusText}: ${await response.text()}`);
}

/**
 * send invites to a group
 */

interface InvitationPayload {
  emails: string[];
  role: string;
}

interface InvitationRequestType {
  emails: string[];
}

interface InvitationResponseType {
  // a list of emails that were successfully invited
  invitations: {
    email: string;
    success: boolean;
  }[];
}

type InvitationCallbacks = MutationCallbacks<InvitationResponseType>;

async function sendGroupInvitations({
  emails,
}: InvitationRequestType): Promise<InvitationResponseType> {
  const payload: InvitationPayload = {
    emails,
    role: "member",
  };

  const response = await fetch(
    API_URL + generateGroupSpecificUrl("invitations/"),
    {
      ...DEFAULT_POST_OPTIONS,
      body: JSON.stringify(payload),
    }
  );
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}

export function useSendGroupInvitations({
  componentOnError,
  componentOnSuccess,
}: InvitationCallbacks): UseMutationResult<
  InvitationResponseType,
  unknown,
  InvitationRequestType,
  unknown
> {
  const queryClient = useQueryClient();
  return useMutation(sendGroupInvitations, {
    onError: componentOnError,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries([USE_GROUP_INVITATION_INFO]);
      componentOnSuccess(data);
    },
  });
}

/**
 * expire all group-specific caches when group is changed in UI.
 * this will not expire caches such as lists of locations
 * or lineages because those won't change or vary depending on
 * which group you are viewing
 */
export async function expireAllCaches(): Promise<void> {
  const queriesToRefetch = [
    USE_PHYLO_RUN_INFO,
    USE_SAMPLE_INFO,
    USE_GROUP_INFO,
    USE_GROUP_INVITATION_INFO,
    USE_GROUP_MEMBER_INFO,
  ];

  forEach(queriesToRefetch, async (q) => {
    await queryClient.invalidateQueries([q]);
    await queryClient.fetchQuery([q]);
  });
}
