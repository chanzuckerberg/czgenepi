interface Group {
  [index: string]: JSONPrimitive;
  type: "V2Group";
  id: number;
  name: string;
}

interface User {
  [index: string]: JSONPrimitive;
  type: "User";
  id: number;
  name: string;
  group: V2Group;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  splitId: string;
}
