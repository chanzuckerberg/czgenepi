import {
  QueryClient,
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import {
  DEFAULT_FETCH_OPTIONS,
  DEFAULT_POST_OPTIONS,
  generateGroupSpecificUrl,
} from "../api";
import { API_URL } from "../constants/ENV";
import { store } from "../redux";
import { selectCurrentGroup } from "../redux/selectors";
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
  group_admin: boolean;
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

export function useGroupInfo(): UseQueryResult<GroupDetails, unknown> {
  const groupId = selectCurrentGroup(store.getState());
  return useQuery([USE_GROUP_INFO, groupId], () => fetchGroup(), {
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
  id: "groupMemberInfo",
};

export function useGroupMembersInfo(): UseQueryResult<GroupMember[], unknown> {
  const groupId = selectCurrentGroup(store.getState());
  return useQuery([USE_GROUP_MEMBER_INFO, groupId], fetchGroupMembers, {
    retry: false,
    select: (data) => {
      const { members } = data;
      return members.map((m) => mapGroupMemberData(m));
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
  id: "groupInvitationInfo",
};

export function useGroupInvitations(): UseQueryResult<Invitation[], unknown> {
  const groupId = selectCurrentGroup(store.getState());
  return useQuery([USE_GROUP_INVITATION_INFO, groupId], fetchGroupInvitations, {
    retry: false,
    select: (data) => {
      const { invitations } = data;
      return invitations.map((i) => mapGroupInvitations(i));
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
export function expireAllCaches(): void {
  const queryClient = new QueryClient();
  queryClient.invalidateQueries([
    USE_PHYLO_RUN_INFO,
    USE_SAMPLE_INFO,
    USE_GROUP_INFO,
    USE_GROUP_INVITATION_INFO,
    USE_GROUP_MEMBER_INFO,
  ]);
}
