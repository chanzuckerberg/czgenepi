// credit: Typescript documentation, src
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types
// gets a property from an object.
export function get<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]; // o[propertyName] is of type T[K]
}

export function jsonToType<T>(
    inputObject: Record<string, any>,
    keyMap: Map<string, keyof T>
): T {
    const entries: Array<Array<string | number | boolean>> = [];
    Object.keys(inputObject).forEach((key) => {
        if (keyMap.has(key)) {
            entries.push([keyMap.get(key), inputObject[key]]);
        } else {
            entries.push([key, inputObject[key]]);
        }
    });
    return Object.fromEntries(entries);
}
