import { Pathogen } from "src/common/redux/types";
import { PathogenStringsType } from "src/common/types/strings";

interface RadioLabelStrings {
  nonContextualizedBestFor: string;
  nonContextualizedDescription: string;
  nonContextualizedGoodFor: string;
  nonContextualizedNotRecommended: string;
  overviewBestFor: string;
  overviewDescription: string;
  overviewGoodFor1: string;
  overviewGoodFor2: string;
  targetedBestFor: string;
  targetedDescription: string;
  targetedGoodFor: string;
}

export const pathogenStrings: PathogenStringsType<RadioLabelStrings> = {
  [Pathogen.COVID]: {
    nonContextualizedBestFor:
      "Best for uncovering sampling bias in your own sampling effort.",
    nonContextualizedDescription:
      "Includes samples from only your jurisdiction from both CZ GEN EPI and GISAID.",
    nonContextualizedGoodFor:
      "Good for seeing viral diversity in your jurisdiction that may not be captured by your own sampling effort.",
    nonContextualizedNotRecommended:
      "Not recommended for epidemiological interpretation due to lack of visibility into viral diversity outside of your jurisdiction and omission of closely-related samples.",
    overviewBestFor:
      "Best for generating a summary tree of samples from your jurisdiction, in the context of genetically similar GISAID samples from outside of your jurisdiction.",
    overviewDescription:
      "Includes samples from both within and outside of your jurisdiction, at a ratio of roughly 2:1.",
    overviewGoodFor1: "Good for identifying possible local outbreaks.",
    overviewGoodFor2:
      "Good for specifying lineage or collection date range to customize samples from your jurisdiction.",
    targetedBestFor: "Best for investigating an identified outbreak.",
    targetedDescription:
      "Includes selected samples and samples that are closely related to the selected samples, at a ratio of roughly 1:2.",
    targetedGoodFor:
      "Good for identifying samples most closely related to the selected samples among all samples in GISAID and your CZ GEN EPI samples.",
  },
};
