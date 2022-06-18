import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "react-query";
import { API, DEFAULT_FETCH_OPTIONS, DEFAULT_POST_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";
import { ENTITIES } from "./entities";
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
  group_admin: boolean;
  email: string;
  created_at: string;
  role: GroupRole;
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

const mapGroupInvitations = (obj: RawInvitationResponse): Invitation => {
  return {
    createdAt: obj.created_at,
    expiresAt: obj.expires_at,
    id: obj.id,
    invitee: obj.invitee,
    inviter: obj.inviter,
  };
};

export const mapGroupMemberData = (obj: RawGroupMemberRequest): GroupMember => {
  return {
    acknowledgedPolicyVersion: obj.acknowledged_policy_version,
    agreedToTos: obj.agreed_to_tos,
    createdAt: obj.created_at,
    email: obj.email,
    id: obj.id,
    isGroupAdmin: obj.group_admin,
    name: obj.name,
    role: obj.role,
  };
};

/**
 * fetch group info
 */
export const USE_GROUP_INFO = {
  entities: [ENTITIES.GROUP_INFO],
  id: "groupInfo",
};

export function useGroupInfo(groupId: number): UseQueryResult<Group, unknown> {
  return useQuery([USE_GROUP_INFO, groupId], () => fetchGroup({ groupId }), {
    retry: false,
    select: mapGroupData,
  });
}

export async function fetchGroup({
  groupId,
}: {
  groupId: number;
}): Promise<RawGroupRequest> {
  const response = await fetch(API_URL + API.GROUPS + groupId + "/", {
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
  id: "groupMemberInfo",
};

export function useGroupMembersInfo(
  groupId: number
): UseQueryResult<GroupMember[], unknown> {
  return useQuery(
    [USE_GROUP_MEMBER_INFO, groupId],
    () => fetchGroupMembers({ groupId }),
    {
      retry: false,
      select: (data) => {
        const { members } = data;
        return members.map((m) => mapGroupMemberData(m));
      },
    }
  );
}

export async function fetchGroupMembers({
  groupId,
}: {
  groupId: number;
}): Promise<GroupMembersFetchResponseType> {
  const response = await fetch(API_URL + API.GROUPS + groupId + "/members/", {
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
  id: "groupInvitationInfo",
};

export function useGroupInvitations(
  groupId: number
): UseQueryResult<Invitation[], unknown> {
  return useQuery(
    [USE_GROUP_INVITATION_INFO, groupId],
    () => fetchGroupInvitations({ groupId }),
    {
      retry: false,
      select: (data) => {
        const { invitations } = data;
        return invitations.map((i) => mapGroupInvitations(i));
      },
    }
  );
}

export async function fetchGroupInvitations({
  groupId,
}: {
  groupId: number;
}): Promise<FetchInvitationResponseType> {
  const response = await fetch(
    API_URL + API.GROUPS + groupId + "/invitations/",
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
  groupId: number;
}

interface InvitationResponseType {
  // a list of emails that were successfully invited
  invitations: string[];
}

type InvitationCallbacks = MutationCallbacks<InvitationResponseType>;

async function sendGroupInvitations({
  emails,
  groupId,
}: InvitationRequestType): Promise<InvitationResponseType> {
  const payload: InvitationPayload = {
    emails,
    role: "member",
  };

  const response = await fetch(
    API_URL + API.GROUPS + groupId + "/invitations/",
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
  return useMutation(sendGroupInvitations, {
    onError: componentOnError,
    onSuccess: componentOnSuccess,
  });
}
