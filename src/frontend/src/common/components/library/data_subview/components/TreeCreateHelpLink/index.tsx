import React from "react";
import IconArrowRightSmall from "src/common/icons/IconArrowRightSmall.svg";
import IconInsightSmall from "src/common/icons/IconInsightSmall.svg";
import { StyledDiv, StyledNewTabLink, StyledSpan } from "./styles";

const TreeCreateHelpLink = (): JSX.Element => {
  const HREF =
    "https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing";
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
