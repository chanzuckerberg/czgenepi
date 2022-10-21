import { generateOrgSpecificUrl, ORG_API } from "src/common/api";
import ENV from "src/common/constants/ENV";

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
export const getCapitalCaseTreeType = (
  phyloRun: PhyloRun
): string | undefined => {
  const { treeType } = phyloRun;

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
