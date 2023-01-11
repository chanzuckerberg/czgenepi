import { Tooltip } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";

interface Props {
  children: React.ReactElement;
  value: string;
}

export const TreeTypeTooltip = ({ children, value }: Props): JSX.Element => {
  let content;

  switch (value) {
    case "Targeted":
      content = "Best for facilitating outbreak investigation.";
      break;
    case "Overview":
      content = `Best for generating a summary tree of samples of interest, in the context of genetically similar samples.`;
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

  // TODO-TR (ehoops): The lineage tooltip wasn't showing when children was wrapped in a fragment rather than a div
  // todo is to verify this tooltip shows and if it doesn't, wrap it in a div.
  return (
    <Tooltip arrow placement="bottom-start" title={TOOLTIP_TEXT}>
      {children}
    </Tooltip>
  );
};
