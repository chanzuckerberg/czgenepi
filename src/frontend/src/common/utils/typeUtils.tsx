// credit: Typescript documentation, src
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types

// gets a property from an object.
export function get<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}

function formatQCMetricsValue(
  inputValue: JSONPrimitive
): { qc_status: string }[] | QCMetrics[] {
  // we have a lot of early processing to do for QCMetrics (we need to add a stub of processing
  // if there are no available qcMetrics, capitalize the statuses for the QCFilter and replace
  // invalid with failed until we have designs to address the invalid case)
  if (JSON.stringify(inputValue) === "[]") {
    return [{ qc_status: "Processing" }];
  } else {
    // this is guaranteed to be QCMetric since we did the earlier check
    const qcMetric = inputValue as unknown as QCMetrics[];
    qcMetric.map((e) => {
      const qcStatusValue = e.qc_status;
      // TODO: remove this when we have designs ready to deal with invalid case, for now put a bandaid over the problem by marking samples as Failed
      if (qcStatusValue === "invalid") {
        e["qc_status"] = "Failed";
      } else {
        // Capitalize first letter of qc_status
        e["qc_status"] =
          qcStatusValue.charAt(0).toUpperCase() + qcStatusValue.slice(1);
      }
    });
    return qcMetric;
  }
}

function getInputValue(
  inputObject: Record<string, JSONPrimitive>,
  key: string
): JSONPrimitive | { qc_status: string }[] | QCMetrics[] {
  // stub qc_status to be 'processing if no qc_metrics data is available (this means sample was recently uploaded)'
  const inputValue = inputObject[key];
  if (key === "qc_metrics") {
    return formatQCMetricsValue(inputValue);
  } else {
    return inputValue;
  }
}

// Take in a whole or subset of an API response that corresponds
// to a defined type in the frontend, along with a mapping of
// differing keys (e.g. if we're going from snake_case to camelCase)
// and converts the data to an object of that type with the right keys.
// Any keys not explicitly set in the mapping will be transferred to the
// new object.
export function jsonToType<T>(
  inputObject: Record<string, JSONPrimitive>,
  keyMap: Map<string, string | number> | null
): T {
  const entries: Array<Array<JSONPrimitive | { qc_status: string }[]>> = [];
  Object.keys(inputObject).forEach((key) => {
    const inputValue = getInputValue(inputObject, key);
    if (keyMap === null) {
      entries.push([key, inputValue]);
    } else if (keyMap.has(key)) {
      entries.push([keyMap.get(key) as string, inputValue]);
    } else {
      entries.push([key, inputValue]);
    }
    // }
  });
  return Object.fromEntries(entries);
}

export function stringGuard(value: unknown): string {
  if (typeof value !== "string") {
    return String(value);
  }
  return value;
}
