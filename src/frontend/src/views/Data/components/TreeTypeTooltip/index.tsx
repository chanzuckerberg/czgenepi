import { Link, Tooltip } from "czifui";
import React from "react";

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
      content = `Best for viewing an overall picture of viral diversity within
      your jurisdiction, including genetically similar samples from outside of
      your jurisdiction. Overview trees are automatically built by Aspen every Monday.`;
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
      <Link
        href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing"
        target="_blank"
        rel="noopener"
      >
        Learn more
      </Link>
    </div>
  );

  return (
    <Tooltip arrow placement="bottom-start" title={TOOLTIP_TEXT}>
      {children}
    </Tooltip>
  );
};
