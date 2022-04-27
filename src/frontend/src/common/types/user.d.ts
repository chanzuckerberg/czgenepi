interface Group {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  group: Group;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  splitId: string;
}

interface RawGroupRequest {
  id: number;
  name: string;
}

interface RawUserRequest {
  id: number;
  name: string;
  group: RawGroupRequest;
  agreed_to_tos: boolean;
  acknowledged_policy_version: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  split_id: string;
}
