import { camelCase, isArray, isObject, transform } from "lodash";
import { generateOrgSpecificUrl, ORG_API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import { TreeType } from "../constants/types";

const { API_URL } = ENV;

export interface IdMap<T> {
  [key: string]: T;
}

/**
 * Reduces an array of objects to a mapping between the keyString arg and the objects
 * that make up the array. Effective for quickly looking up objects by id, for example.
 */
export const reduceObjectArrayToLookupDict = <T extends Record<string, any>>(
  arr: T[],
  keyedOn: string
): IdMap<T> => {
  const keyValuePairs = arr.map((obj: T) => {
    const id = obj[keyedOn];
    return [id, obj];
  });
  return Object.fromEntries(keyValuePairs);
};

/**
 * Phylo run transforms
 */

/**
 * If there is a tree associated with this run, return links to download tree data
 */
interface PhyloRunLinks {
  downloadLinkIdStylePublicIdentifiers: string | undefined;
  downloadLinkIdStylePrivateIdentifiers: string | undefined;
  accessionsLink: string | undefined;
}

export const getDownloadLinks = (phyloRun: PhyloRun): PhyloRunLinks => {
  const id = phyloRun?.phyloTree?.id;

  const links: PhyloRunLinks = {
    downloadLinkIdStylePublicIdentifiers: undefined,
    downloadLinkIdStylePrivateIdentifiers: undefined,
    accessionsLink: undefined,
  };

  if (!id) return links;

  links.downloadLinkIdStylePrivateIdentifiers = `${API_URL}${generateOrgSpecificUrl(
    ORG_API.PHYLO_TREES
  )}${id}/download`;

  links.downloadLinkIdStylePublicIdentifiers = `${API_URL}${generateOrgSpecificUrl(
    ORG_API.PHYLO_TREES
  )}${id}/download?id_style=public`;

  links.accessionsLink = `${API_URL}${generateOrgSpecificUrl(
    ORG_API.PHYLO_TREES
  )}${id}/sample_ids`;

  return links;
};

/**
 * Converts a completely uppercase tree type to a capitalcase tree type.
 */
type PhyloTreeManipulationType = PhyloRun & { tree_type?: TreeType };
export const getCapitalCaseTreeType = (
  phyloRun: PhyloTreeManipulationType
): string | undefined => {
  const { tree_type: treeType } = phyloRun;

  if (typeof treeType !== "string" || treeType.toLowerCase() == "unknown") {
    return undefined;
  }

  const nameParts = treeType.toLowerCase().split("_");
  for (let i = 0; i < nameParts.length; i++) {
    const part = nameParts[i];
    nameParts[i] = part.charAt(0).toUpperCase() + part.slice(1);
  }

  return nameParts.join("-");
};

/**
 * Accepts any object with arbitrary levels of nesting (the nested bits can be objs or arrays),
 * and returns essentially the same object with all the keys camelCased instead of snake_cased.
 * Useful for parsing backend responses.
 */
export const camelize = (obj: any): any => {
  return transform(obj, (acc, value, key, target) => {
    const camelKey = isArray(target) ? key : camelCase(key);
    acc[camelKey] = isObject(value) ? camelize(value) : value;
  });
};

/**
 * Will change the key associated with a value for the given object and keys.
 * Example:
 *   >>> replaceKeyName({ a: "apple" }, "a", "b");
 *   <<< { b: "apple"}
 */
export const replaceKeyName = (
  obj: any,
  oldKey: string,
  newKey: string
): any => {
  if (oldKey === newKey) return;

  Object.defineProperty(
    obj,
    newKey,
    Object.getOwnPropertyDescriptor(obj, oldKey) ?? {}
  );

  delete obj[oldKey];
};
