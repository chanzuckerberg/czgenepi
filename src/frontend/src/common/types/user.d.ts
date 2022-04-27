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

interface UpdateUser {
  acknowledged_policy_version: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  agreed_to_tos: boolean;
}
