// Produce unique string to name a GISAID location from its various attributes
export function stringifyGisaidLocation(location: GisaidLocation): string {
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
