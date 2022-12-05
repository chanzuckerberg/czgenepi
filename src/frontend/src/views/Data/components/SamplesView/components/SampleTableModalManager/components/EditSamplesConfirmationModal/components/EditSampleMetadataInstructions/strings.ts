import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface EditSamplesStrings {
  templateName: string;
}

const generalViralImportFileStrings: EditSamplesStrings = {
  templateName: "Download General Viral Metadata Template (TSV)",
};

export const editSamplesPathogenStrings: PathogenConfigType<EditSamplesStrings> =
  {
    [Pathogen.COVID]: {
      templateName: "Download SARS-CoV-2 Metadata Template (TSV)",
    },
    [Pathogen.MONKEY_POX]: generalViralImportFileStrings,
  };
