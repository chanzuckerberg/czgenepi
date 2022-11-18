import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/strings";

interface ImportFileStrings {
  templateName: string;
}

const generalViralImportFileStrings: ImportFileStrings = {
  templateName: "Download General Viral Metadata Template (TSV)",
};

export const importFilePathogenStrings: PathogenConfigType<ImportFileStrings> =
  {
    [Pathogen.COVID]: {
      templateName: "Download SARS-CoV-2 Metadata Template (TSV)",
    },
    [Pathogen.MONKEY_POX]: generalViralImportFileStrings,
  };
