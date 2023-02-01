import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { API, getBackendApiJson } from "../api";
import { store } from "../redux";
import { selectCurrentPathogen } from "../redux/selectors";
import { Pathogen } from "../redux/types";
import { PathogenConfigType } from "../types/pathogenConfig";
import { IdMap, reduceObjectArrayToLookupDict } from "../utils/dataTransforms";
import { ENTITIES } from "./entities";

export interface LocationsResponse {
  locations: GisaidLocation[];
}

const locationDepthPathogenConfig: PathogenConfigType<
  keyof GisaidLocation | null
> = {
  [Pathogen.COVID]: null,
  [Pathogen.MONKEY_POX]: "division",
};

const fetchLocations = (): Promise<LocationsResponse> => {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);

  const route =
    locationDepthPathogenConfig[pathogen] === null
      ? API.LOCATIONS
      : `${API.LOCATIONS}?max_location_depth=${locationDepthPathogenConfig[pathogen]}`;

  return getBackendApiJson(route);
};

export const USE_LOCATIONS_INFO_QUERY_KEY = {
  entities: [ENTITIES.LOCATION_INFO],
  id: "locationInfo",
};

const ONE_HOUR = 1000 * 60 * 60; // for react-query; milliseconds

export function useLocations(): UseQueryResult<LocationsResponse, unknown> {
  return useQuery([USE_LOCATIONS_INFO_QUERY_KEY], fetchLocations, {
    retry: false,
    // Because locations are very stable and mildly heavy (~2Meg), we mark
    // stale and re-fetch after an hour rather than default insta-stale.
    // Note, this does not prevent garbage cleanup due to `cacheTime` if user
    // does not have data "actively" used. In that case, re-fetch would happen
    // next time a component using this data mounts and uses this func.
    staleTime: ONE_HOUR,
  });
}

interface NamedLocationsResponse {
  namedLocations: NamedGisaidLocation[];
}

export const foldInLocationName = (
  location: GisaidLocation
): NamedGisaidLocation => {
  return {
    ...location,
    name: stringifyGisaidLocation(location),
  };
};

const foldInNamesToLocations = (
  data: LocationsResponse
): NamedLocationsResponse => {
  const { locations } = data;
  return {
    namedLocations: locations.map(foldInLocationName),
  };
};

// Provides same underlying locations data, but also adds in `name` for each location.
export function useNamedLocations(): UseQueryResult<
  NamedLocationsResponse,
  unknown
> {
  return useQuery([USE_LOCATIONS_INFO_QUERY_KEY], fetchLocations, {
    retry: false,
    // Using `select` allows it to share cache with other USE_LOCATIONS_INFO_QUERY_KEY,
    // but give a different view on the same data after processed by `select` func.
    select: foldInNamesToLocations,
    // It's stable, avoid unnecessary re-fetches. More info in `useLocations`
    staleTime: ONE_HOUR,
  });
}

interface NamedLocationsByIdResponse {
  namedLocationsById: IdMap<NamedGisaidLocation>;
}

const getNamedLocationsById = (
  data: LocationsResponse
): NamedLocationsByIdResponse => {
  const { locations } = data;
  const namedLocations = locations.map(foldInLocationName);
  return {
    namedLocationsById: reduceObjectArrayToLookupDict(namedLocations, "id"),
  };
};

export function useNamedLocationsById(): UseQueryResult<
  NamedLocationsByIdResponse,
  unknown
> {
  return useQuery([USE_LOCATIONS_INFO_QUERY_KEY], fetchLocations, {
    retry: false,
    // Using `select` allows it to share cache with other USE_LOCATIONS_INFO_QUERY_KEY,
    // but give a different view on the same data after processed by `select` func.
    select: getNamedLocationsById,
    // It's stable, avoid unnecessary re-fetches. More info in `useLocations`
    staleTime: ONE_HOUR,
  });
}
