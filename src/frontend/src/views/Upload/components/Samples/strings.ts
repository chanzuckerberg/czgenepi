import { StringsType } from "src/common/types/strings";

interface UploadSamplesStrings {
  header: string;
  acceptedFormats: string;
}

export const pathogenStrings: StringsType<UploadSamplesStrings> = {
  covid: {
    header: "Select SARS-CoV-2 Consensus Genome Files",
    acceptedFormats:
      "Accepted file formats: fasta (.fa or .fasta), fasta.gz (.fa.gz), fasta.zip, plain text (.txt)",
  },
};
