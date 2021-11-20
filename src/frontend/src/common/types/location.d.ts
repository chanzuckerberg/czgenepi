interface GisaidLocation {
  [index: string]: string | number;
  region: string;
  country: string;
  division: string;
  location: string;
  id: number;
}

interface GisaidLocationOption {
  [index: string]: string | number;
  name: string;
  description: string;
  id: number;
}
