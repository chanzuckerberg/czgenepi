interface Group {
  address: string;
  id: number;
  location: GisaidLocation;
  name: string;
  prefix: string;
}

interface User {
  id: number;
  name: string;
  isGroupAdmin?: boolean;
  group?: Group;
  agreedToTos: boolean;
  acknowledgedPolicyVersion: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  splitId: string;
}
