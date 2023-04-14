import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface InputInstructionsStrings {
  publicRepositoryIdType: string;
  publicRepositoryIdExamples: string;
}

export const InputInstructionsPathogenStrings: PathogenConfigType<InputInstructionsStrings> =
  {
    [Pathogen.COVID]: {
      publicRepositoryIdType: "GenBank Isolate Names, GISAID IDs",
      publicRepositoryIdExamples:
        "USA/CA-CZB-0000/2021, hCoV-19/USA/CA-CZB-0000/2021",
    },
    [Pathogen.MONKEY_POX]: {
      publicRepositoryIdType: "GenBank Isolate Names",
      publicRepositoryIdExamples: "USA/CA-CZB-0000/2021",
    },
  };
