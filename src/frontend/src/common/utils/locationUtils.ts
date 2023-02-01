import { distance } from "fastest-levenshtein";

// Produce unique string to name a GISAID location from its various attributes
export function stringifyGisaidLocation(location?: GisaidLocation): string {
  if (!location) return "";

  let stringName = "";
  const orderedKeys: Array<keyof GisaidLocation> = [
    "region",
    "country",
    "division",
    "location",
  ];
  orderedKeys.every((key) => {
    if (location[key]) {
      if (key != "region") {
        stringName += "/";
      }
      stringName += `${location[key]}`;
      return true;
    } else {
      return false;
    }
  });
  return stringName;
}

// Cache for location finding since most users will repeat same location often
type LocationFinderCache = Record<string, NamedGisaidLocation>;

/**
 * Find closest matching location based on user-provided string.
 *
 * Generally focused on comparing levenshtein distances between provided
 * locationString and all Location.locations -- narrowest scope, city/county
 * level -- and returning the closest match.
 *
 * Additionally, a Location can be found by its canonical name from the func
 * `stringifyGisaidLocation` above. If an exactly matching string is provided,
 * that Location will be selected. This allows non-Location.locations to be
 * chosen (eg, `North America/USA/California` since it is state-level and has
 * county-level specification).
 *
 * TODO: would be nice to bias the final results towards a user's group's
 * location (right now, "Los Angeles" would return the one in Chile, etc),
 * but that requires new info to come from BE and to incorporate that here.
 *
 * The `locationFinderCache` is not strictly necessary, but the entirety of
 * the Locations we fetch from API is ~20k records, so this is actually
 * a decently heavy call since we check against every record. Additionally,
 * we use this to process metadata file uploads, so we can potentially have
 * 100s of calls one after another. It's a pure function though, so it's easy
 * to cache previous calls. See the `createStringToLocationFinder` below for
 * a convenient way to handle that kind of batched processing with a cache.
 * However, if a cache wouldn't make sense for your use-case, will work fine
 * without it.
 */
function findLocationFromString(
  locationString: string,
  locations: NamedGisaidLocation[],
  locationFinderCache: LocationFinderCache | null = null
): NamedGisaidLocation | undefined {
  // Safety check -- Should not occur, but if app hasn't finished loading the
  // Locations data and this gets called, would blow up because we assume there
  // are some Locations below. Instead, fallback to `undefined` location.
  if (locations.length === 0) {
    return undefined;
  }

  // Only do cache interactions if one was provided
  if (locationFinderCache !== null && locationFinderCache[locationString]) {
    return locationFinderCache[locationString];
  }
  const scoredLocations: [NamedGisaidLocation, number][] = locations.map(
    (location) => {
      if (location.name === locationString) {
        // Because matched to canonical name, supersede levenshtein distance
        return [location, -1]; // -1 will be better than best possible of 0
      }
      // Not all Locations have narrowest scope, skip if it's missing
      if (location.location) {
        return [location, distance(location.location, locationString)];
      }
      return [location, 99];
    }
  );
  const candidateLocation = scoredLocations.reduce(
    ([prevLocation, prevScore], [currLocation, currScore]) => {
      if (currScore < prevScore) {
        return [currLocation, currScore];
      }
      return [prevLocation, prevScore];
    }
  );
  const foundLocation = candidateLocation[0];
  // If using cache, add latest result in to make future searches faster
  if (locationFinderCache !== null) {
    locationFinderCache[locationString] = foundLocation;
  }
  return foundLocation;
}

export type StringToLocationFinder = (
  locationString: string
) => NamedGisaidLocation | undefined;

/**
 * Creates location finder func that will convert location strings to Location
 *
 * Uses the cache feature provided by findLocationFromString because most calls
 * by a user will actually repeatedly be for the same string. For example, the
 * DPH for Humboldt County would upload a metadata TSV with 100s of rows that
 * all have the location given as "Humboldt County".
 *
 * Note: don't create location finders at a global level and keep them around.
 * The provided `locations` and cache should get invalidated and refreshed from
 * time to time, because available Locations occasionally changes. Should get
 * created at the level of the component using it, so it will be dropped when
 * the user navigates to a different page, preventing it from getting stale.
 */
export function createStringToLocationFinder(
  locations: NamedGisaidLocation[]
): StringToLocationFinder {
  const locationFinderCache: LocationFinderCache = {};
  return (locationString: string) => {
    return findLocationFromString(
      locationString,
      locations,
      locationFinderCache
    );
  };
}

export const getNameFromCollectionLocation = (
  collectionLocation: NamedGisaidLocation | string | undefined
): string => {
  // collection location will always be a NamedGisaidLocation at this stage,
  // the only time collectionLocation will be a string is during tsv upload
  // where collectionLocation can be "DELETE" (when a user wants to clear a value)
  if (collectionLocation && typeof collectionLocation !== "string") {
    return collectionLocation.name;
  }

  return "";
};

export const getIdFromCollectionLocation = (
  collectionLocation: NamedGisaidLocation | string | undefined
): number | undefined => {
  if (collectionLocation && typeof collectionLocation !== "string") {
    return collectionLocation.id;
  }
};

function findMaxDepthLocation(
  searchLocation: GisaidLocation | NamedGisaidLocation,
  maxDepth: keyof GisaidLocation,
  locations: NamedGisaidLocation[],
  locationFinderCache: LocationFinderCache | null = null
): NamedGisaidLocation | undefined {
  // Safety check -- Should not occur, but if app hasn't finished loading the
  // Locations data and this gets called, would blow up because we assume there
  // are some Locations below. Instead, fallback to `undefined` location.
  if (locations.length === 0) {
    return undefined;
  }

  // Only do cache interactions if one was provided
  if (
    locationFinderCache !== null &&
    locationFinderCache[`${searchLocation.id}${maxDepth}`]
  ) {
    return locationFinderCache[`${searchLocation.id}${maxDepth}`];
  }

  const locationHierarchy: (keyof GisaidLocation)[] = [
    "region",
    "country",
    "division",
    "location",
  ];
  const finalIndex = locationHierarchy.findIndex(
    (element) => element === maxDepth
  );

  const foundLocations = locationHierarchy.reduce((acc, tier, index) => {
    // Until we get to the index of the maxDepth, search for the searchLocation value
    // After that, search for null
    const filterValue = index <= finalIndex ? searchLocation[tier] : null;
    return acc.filter((value) => value[tier] === filterValue);
  }, locations);

  const foundLocation =
    foundLocations.length > 0 ? foundLocations[0] : undefined;

  // If using cache, add latest result in to make future searches faster
  if (locationFinderCache !== null && foundLocation) {
    locationFinderCache[`${searchLocation.id}${maxDepth}`] = foundLocation;
  }
  return foundLocation;
}

export type LocationMaxDepthFinder = (
  searchLocation: GisaidLocation,
  maxDepth: keyof GisaidLocation
) => NamedGisaidLocation | undefined;

export function createMaxDepthLocationFinder(
  locations: NamedGisaidLocation[]
): LocationMaxDepthFinder {
  const locationFinderCache: LocationFinderCache = {};
  return (searchLocation: GisaidLocation, maxDepth: keyof GisaidLocation) => {
    return findMaxDepthLocation(
      searchLocation,
      maxDepth,
      locations,
      locationFinderCache
    );
  };
}
