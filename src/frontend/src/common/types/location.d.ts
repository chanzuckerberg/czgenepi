interface Location {
  [index: string]: string | number;
  region: string;
  country: string;
  division: string;
  location: string;
  id: number;
}

interface LocationOption {
  [index: string]: string | number;
  name: string;
  description: string;
  id: number;
}
