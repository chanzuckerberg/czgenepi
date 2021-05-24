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
];
