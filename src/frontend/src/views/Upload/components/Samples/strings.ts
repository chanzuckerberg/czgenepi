import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/strings";

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
  // TODO: (ehoops) - these are just copy pasta to appease typescript. Copy changes have their own ticket.
  [Pathogen.MONKEY_POX]: {
    header: "Select SARS-CoV-2 Consensus Genome Files",
    acceptedFormats:
      "Accepted file formats: fasta (.fa or .fasta), fasta.gz (.fa.gz), fasta.zip, plain text (.txt)",
  },
};
