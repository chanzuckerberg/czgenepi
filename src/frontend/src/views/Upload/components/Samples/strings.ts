import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

interface UploadSamplesStrings {
  header: string;
  acceptedFormats: string;
}

export const pathogenStrings: PathogenConfigType<UploadSamplesStrings> = {
  [Pathogen.COVID]: {
    header: "Select SARS-CoV-2 Consensus Genome Files",
    acceptedFormats:
      "Accepted file formats: fasta (.fa or .fasta), fasta.gz (.fa.gz), fasta.zip, plain text (.txt)",
  },
  [Pathogen.MONKEY_POX]: {
    header: "Select Mpox Consensus Genome Files",
    acceptedFormats:
      "Accepted file formats: fasta (.fa or .fasta), fasta.gz (.fa.gz), fasta.zip",
  },
};
