import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface InputInstructionsStrings {
  publicRepositoryIds: string;
  publicRepositoryIdExamples: string;
}

export const InputInstructionsPathogenStrings: PathogenConfigType<InputInstructionsStrings> =
  {
    [Pathogen.COVID]: {
      publicRepositoryIds: "GISAID IDs",
      publicRepositoryIdExamples:
        "USA/CA-CZB-0000/2021, hCoV-19/USA/CA-CZB-0000/2021 or EPI_ISL_0000",
    },
    [Pathogen.MONKEY_POX]: {
      publicRepositoryIds: "GenBank accession numbers",
      publicRepositoryIdExamples: "U12345 or AF123456",
    },
  };
