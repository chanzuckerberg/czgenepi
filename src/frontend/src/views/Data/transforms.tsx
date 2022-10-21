import { generateOrgSpecificUrl, ORG_API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import type { TreeType } from "src/common/constants/types";

const { API_URL } = ENV;

//* (mlila): below, we want to use the tree id to generate the urls in question.
//* Links can only be generated for workflows with a tree
export const PHYLO_RUN_TRANSFORMS: Transform[] = [
  {
    inputs: ["phyloTree"],
    key: "downloadLinkIdStylePrivateIdentifiers",
    method: (inputs: Tree[]): string | undefined => {
      const id = inputs[0]?.id;
      if (typeof id !== "number") {
        return undefined;
      }
      return `${API_URL}${generateOrgSpecificUrl(
        ORG_API.PHYLO_TREES
      )}${id}/download`;
    },
  },
  {
    inputs: ["phyloTree"],
    key: "downloadLinkIdStylePublicIdentifiers",
    method: (inputs: Tree[]): string | undefined => {
      const id = inputs[0]?.id;
      if (typeof id !== "number") {
        return undefined;
      }
      return `${API_URL}${generateOrgSpecificUrl(
        ORG_API.PHYLO_TREES
      )}${id}/download?id_style=public`;
    },
  },
  {
    inputs: ["phyloTree"],
    key: "accessionsLink",
    method: (inputs: Tree[]): string | undefined => {
      const id = inputs[0]?.id;
      if (typeof id !== "number") {
        return undefined;
      }
      return `${API_URL}${generateOrgSpecificUrl(
        ORG_API.PHYLO_TREES
      )}${id}/sample_ids`;
    },
  },
  {
    inputs: ["treeType"],
    key: "treeType",
    method: (inputs: TreeType[]): string | undefined => {
      const tree_type = inputs[0];
      if (
        typeof tree_type !== "string" ||
        tree_type.toLowerCase() == "unknown"
      ) {
        return undefined;
      }
      const name_parts = tree_type.toLowerCase().split("_");
      for (let i = 0; i < name_parts.length; i++) {
        const part = name_parts[i];
        name_parts[i] = part.charAt(0).toUpperCase() + part.slice(1);
      }
      return name_parts.join("-");
    },
  },
];
