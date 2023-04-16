import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface InputInstructionsStrings {
  publicRepositoryIdType: string;
  publicRepositoryIdExamples: string;
}

export const InputInstructionsPathogenStrings: PathogenConfigType<InputInstructionsStrings> =
  {
    [Pathogen.COVID]: {
      publicRepositoryIdType: 
        "GenBank Isolate Names without SARS-CoV-2/human/ prefix",
      publicRepositoryIdExamples: "USA/CA-CZB-0000/2021",
    },
    [Pathogen.MONKEY_POX]: {
      publicRepositoryIdType: "GenBank accession numbers",
      publicRepositoryIdExamples: "U12345 or AF123456",
    },
  };
