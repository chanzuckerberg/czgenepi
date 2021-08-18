import { API, DEFAULT_POST_OPTIONS } from "../api";
import { API_URL } from "../constants/ENV";

interface CreateTreePayload {
  name: string;
  samples: string[];
  tree_type: string;
}

export async function createTree({
  sampleIds,
  treeName,
  treeType,
}: {
  sampleIds: string[];
  treeName: string;
  treeType: string;
}): Promise<unknown> {
  const payload: CreateTreePayload = {
    name: treeName,
    samples: sampleIds,
    tree_type: treeType,
  };
  const response = await fetch(API_URL + API.CREATE_TREE, {
    ...DEFAULT_POST_OPTIONS,
    body: JSON.stringify(payload),
  });
  if (response.ok) return await response.json();

  throw Error(`${response.statusText}: ${await response.text()}`);
}
