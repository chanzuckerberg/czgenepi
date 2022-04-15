import { Collapse } from "@material-ui/core";
import React, { useState } from "react";
import {
  ColumnFlexContainer,
  RowFlexContainer,
  StaticSizeDiv,
  StyledArrowDownIcon,
  StyledArrowUpIcon,
  StyledCallout,
} from "./style";

interface Props {
  collapseContent: React.ReactNode;
  intent: "info" | "error" | "success" | "warning";
  title: React.ReactNode;
}

export default function AlertAccordion({
  collapseContent,
  intent,
  title,
}: Props): JSX.Element {
  const [isCollapseOpen, setCollapseOpen] = useState<boolean>(false);

  const toggleCollapse = () => {
    setCollapseOpen(!isCollapseOpen);
  };

  return (
    <StyledCallout intent={intent} onClick={toggleCollapse}>
      <RowFlexContainer>
        <ColumnFlexContainer>
          <StaticSizeDiv>{title}</StaticSizeDiv>
          <Collapse in={isCollapseOpen}>{collapseContent}</Collapse>
        </ColumnFlexContainer>
        {isCollapseOpen ? <StyledArrowUpIcon /> : <StyledArrowDownIcon />}
      </RowFlexContainer>
    </StyledCallout>
  );
}
