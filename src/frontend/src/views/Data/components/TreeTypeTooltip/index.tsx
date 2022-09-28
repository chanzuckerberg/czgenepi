import { useTreatments } from "@splitsoftware/splitio-react";
import { Tooltip } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { FEATURE_FLAGS, isFlagOn } from "src/components/Split";

interface Props {
  children: React.ReactElement;
  value: string;
}

export const TreeTypeTooltip = ({ children, value }: Props): JSX.Element => {
  const flag = useTreatments([FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isFlagOn(
    flag,
    FEATURE_FLAGS.tree_location_filter
  );

  let content;

  switch (value) {
    case "Targeted":
      content = "Best for facilitating outbreak investigation.";
      break;
    case "Overview":
      content = isTreeLocationFilterFlagOn
        ? `Best for generating a summary tree of samples of interest, in the context of genetically similar samples.`
        : `Best for viewing an overall picture of viral diversity within
      your jurisdiction, including genetically similar samples from outside of
      your jurisdiction.`;
      break;
    case "Non-Contextualized":
      content =
        "Best for uncovering sampling bias in your own sampling effort.";
      break;
    default:
      content = "Unknown tree type.";
  }

  const TOOLTIP_TEXT = (
    <div>
      {content}{" "}
      <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing">
        Learn more
      </NewTabLink>
    </div>
  );

  return (
    <Tooltip arrow placement="bottom-start" title={TOOLTIP_TEXT}>
      {children}
    </Tooltip>
  );
};
