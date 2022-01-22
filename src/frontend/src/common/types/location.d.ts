interface GisaidLocation {
  region: string;
  country: string;
  division: string;
  location: string;
  id: number;
}

interface NamedGisaidLocation extends GisaidLocation {
  name: string;
}
