import { sample } from "lodash";
import { getADateInThePast, getValueOrDefault } from "./common";

const lineages = ["A", "BA.1.1", "BA.1.15"];

export class NextstrainUtil {
  public static getNextStrainTreeData(
    defaults?: NextStrainTreeData
  ): NextStrainTreeData {
    const treeTypes = ["OVERVIEW", "TARGETED"];

    return {
      name: getValueOrDefault(defaults?.name, "Some Name") as string,
      samples: defaults?.samples !== undefined ? defaults?.samples : [],
      tree_type: getValueOrDefault(
        defaults?.tree_type,
        sample(treeTypes)
      ) as string,
      template_args: {
        filter_start_date: getValueOrDefault(
          defaults?.template_args?.filter_start_date,
          getADateInThePast()
        ) as string,
        filter_pango_lineages: getValueOrDefault(
          defaults?.template_args?.filter_pango_lineages,
          lineages
        ) as Array<string>,
      },
    };
  }
}

export interface NextStrainTreeData {
  name: string;
  samples: any;
  tree_type: string;
  template_args: {
    filter_start_date: string;
    filter_pango_lineages: Array<string>;
  };
}
