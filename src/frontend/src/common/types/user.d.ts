interface UserGroup {
  id: number;
  name: string;
  roles: GroupRole[];
}

interface GroupDetails {
  address: string;
  id: number;
  location: GisaidLocation;
  name: string;
  prefix: string;
}

type BaseUser = {
  id: number;
  name: string;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
};

interface User extends BaseUser {
  groups: UserGroup[];
  splitId: string;
  analyticsId: string;
  gisaidSubmitterId: string;
}

type GroupRole = "member" | "admin";

interface GroupMember extends BaseUser {
  createdAt: string; // not yet returned from backend
  email: string;
  role: GroupRole;
}
