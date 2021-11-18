import { API, DEFAULT_FETCH_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";

export interface LocationsResponse {
  locations: Location[];
}

export async function getLocations(): Promise<LocationsResponse> {
  const response = await fetch(API_URL + API.LOCATIONS, {
    ...DEFAULT_FETCH_OPTIONS,
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}
