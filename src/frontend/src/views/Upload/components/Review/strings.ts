import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/strings";

interface ReviewSamplesStrings {
  pathogenName: string;
}

export const reviewSamplesPathogenStrings: PathogenConfigType<ReviewSamplesStrings> =
  {
    [Pathogen.COVID]: {
      pathogenName: "SARS-CoV-2",
    },
    [Pathogen.MONKEY_POX]: {
      pathogenName: "Mpox",
    },
  };
