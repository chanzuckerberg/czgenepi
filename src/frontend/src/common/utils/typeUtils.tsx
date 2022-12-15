// credit: Typescript documentation, src
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types
// gets a property from an object.
export function get<T, K extends keyof T>(o: T, propertyName: K): T[K] {
  return o[propertyName]; // o[propertyName] is of type T[K]
}

function getInputValue(inputObject: Record<string, JSONPrimitive>, key: string): JSONPrimitive | { qc_status: string; }[] {
  const inputValue = inputObject[key];
  if (key === "qc_metrics") {
    if (JSON.stringify(inputValue) === "[]") {
      const mockEntry = [{qc_status: "processing"}]
      return mockEntry;
    } else {
      return inputValue;
    }
  } else {
    return inputValue;
  }
}; 

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
  const entries: Array<Array<JSONPrimitive | { qc_status: string; }[]>> = [];
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
