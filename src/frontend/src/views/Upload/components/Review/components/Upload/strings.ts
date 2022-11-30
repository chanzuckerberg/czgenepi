import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface UploadCompleteStrings {
  pathogenName: string;
}

export const uploadCompletePathogenStrings: PathogenConfigType<UploadCompleteStrings> =
  {
    [Pathogen.COVID]: {
      pathogenName: "SARS-CoV-2",
    },
    [Pathogen.MONKEY_POX]: {
      pathogenName: "mpox",
    },
  };
