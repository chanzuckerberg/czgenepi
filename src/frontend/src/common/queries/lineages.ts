/**
 * Queries for pulling pathogen lineages.
 *
 * Right now, this is only pulling Pango lineages, but we still generally
 * use the generic term of "lineage" as opposed to specifically calling out
 * it being "Pango lineages". Unsure what intent is long-term for how/if we
 * will bring in other lineages (like WHO greek letter names). For now, easiest
 * seems to just be letting Pango squat on the generic name, but we might
 * have to break it out into its own query or sub-fetch or something once
 * we begin to bring in other types of lineage.
 */
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { API, getBackendApiJson } from "../api";
import { ENTITIES } from "./entities";

// At heart, a lineage is just a string, eg "B.1.1.12" or "Delta"
type LineageName = string;

interface LineagesResponse {
  lineages: LineageName[];
}

const fetchLineages = (): Promise<LineagesResponse> => {
  return getBackendApiJson(API.PANGO_LINEAGES);
};

export const USE_LINEAGES_INFO_QUERY_KEY = {
  entities: [ENTITIES.LINEAGES_INFO],
  id: "lineagesInfo",
};

export function useLineages(): UseQueryResult<LineagesResponse, unknown> {
  return useQuery([USE_LINEAGES_INFO_QUERY_KEY], fetchLineages, {
    retry: false,
  });
}
