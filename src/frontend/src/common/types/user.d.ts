interface Group {
  [index: string]: JSONPrimitive;
  type: "Group";
  address: string;
  email: string;
  id: number;
  name: string;
}

interface User {
  [index: string]: JSONPrimitive;
  type: "User";
  auth0UserId: string;
  email: string;
  groupAdmin: boolean;
  groupId: number;
  id: number;
  name: string;
  systemAdmin: boolean;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
}

interface V2User {
  [index: string]: JSONPrimitive;
  type: "User";
  auth0UserId: string;
  email: string;
  group: Group;
  id: number;
  name: string;
  systemAdmin: boolean;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
}
