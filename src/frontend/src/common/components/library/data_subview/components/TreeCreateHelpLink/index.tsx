import React from "react";
import IconArrowRightSmall from "src/common/icons/IconArrowRightSmall.svg";
import IconInsightSmall from "src/common/icons/IconInsightSmall.svg";
import { StyledDiv, StyledNewTabLink, StyledSpan } from "./styles";

const TreeCreateHelpLink = (): JSX.Element => {
  const HREF =
    "https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees#customizing";
  return (
    <StyledDiv>
      <StyledNewTabLink href={HREF}>
        <IconInsightSmall />
        <StyledSpan>How can I create my own tree?</StyledSpan>
        <IconArrowRightSmall />
      </StyledNewTabLink>
    </StyledDiv>
  );
};

export { TreeCreateHelpLink };
