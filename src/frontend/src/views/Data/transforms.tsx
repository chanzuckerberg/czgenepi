import ENV from "src/common/constants/ENV";

const { API_URL } = ENV;

export const TREE_TRANSFORMS: Transform[] = [
  {
    inputs: ["id"],
    key: "downloadLink",
    method: (inputs: number[]): string | undefined => {
      const id = inputs[0];
      if (typeof id !== "number") {
        return undefined;
      }
      return `${API_URL}/api/phylo_tree/${id}`;
    },
  },
  {
    inputs: ["id"],
    key: "accessionsLink",
    method: (inputs: number[]): string | undefined => {
      const id = inputs[0];
      if (typeof id !== "number") {
        return undefined;
      }
      return `${API_URL}/api/phylo_tree/sample_ids/${id}`;
    },
  },
  {
    inputs: ["treeType"],
    key: "treeType",
    method: (inputs: string[]): string | undefined => {
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
