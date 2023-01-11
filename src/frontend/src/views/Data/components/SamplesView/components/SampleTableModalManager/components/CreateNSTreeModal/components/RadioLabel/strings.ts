import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";

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

const generalViralRadioLabelStrings: RadioLabelStrings = {
  nonContextualizedBestFor:
    "Best for uncovering sampling bias in your own sampling effort.",
  nonContextualizedDescription: "Builds tree with only samples of interest.",
  nonContextualizedGoodFor:
    "Good for seeing viral diversity in the public repository that may not be captured by your own sampling effort.",
  nonContextualizedNotRecommended:
    "Not recommended for epidemiological interpretation due to lack of visibility into viral diversity outside of the selections below and omission of closely-related samples.",
  overviewBestFor:
    "Best for generating a summary tree of samples of interest, in the context of genetically similar public repository samples.",
  overviewDescription:
    "Builds tree focused around samples of interest and closely-related samples, at a ratio of roughly 2:1.",
  overviewGoodFor1: "Good for identifying possible local outbreaks.",
  overviewGoodFor2:
    "Good for specifying sample location, collection date, or lineages instead of the defaults used for your CZ GEN EPI weekly build.",
  targetedBestFor: "Best for investigating an identified outbreak.",
  targetedDescription:
    "Builds tree with selected samples (from the sample table or the ID box below) and closely-related samples, at a ratio of roughly 1:2. ",
  targetedGoodFor:
    "Good for identifying samples most closely related to the selected samples among all public repository samples and your CZ GEN EPI samples.",
};

export const pathogenStrings: PathogenConfigType<RadioLabelStrings> = {
  [Pathogen.COVID]: generalViralRadioLabelStrings,
  [Pathogen.MONKEY_POX]: generalViralRadioLabelStrings,
};
