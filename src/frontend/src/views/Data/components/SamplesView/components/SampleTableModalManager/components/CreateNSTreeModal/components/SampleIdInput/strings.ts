import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface SampleIdInputStrings {
  idPlaceholderText: string;
}

export const SampleIdInputPathogenStrings: PathogenConfigType<SampleIdInputStrings> =
  {
    [Pathogen.COVID]: {
      idPlaceholderText: "e.g. USA/CA-CZB-0000/2021, USA/CA-CDPH-000000/2021",
    },
    [Pathogen.MONKEY_POX]: {
      idPlaceholderText: "e.g. U12345, AF123456",
    },
  };
