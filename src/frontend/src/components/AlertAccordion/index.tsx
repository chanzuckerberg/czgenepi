import React, { useState } from "react";
import {
  ColumnFlexContainer,
  RowFlexContainer,
  StaticSizeDiv,
  StyledArrowDownIcon,
  StyledArrowUpIcon,
  StyledCallout,
  StyledCollapse,
} from "./style";

interface Props {
  collapseContent: React.ReactNode;
  intent: "info" | "error" | "success" | "warning";
  title: React.ReactNode;
  icon?: React.ReactNode;
}

export default function AlertAccordion({
  collapseContent,
  intent,
  title,
  icon,
}: Props): JSX.Element {
  const [isCollapseOpen, setCollapseOpen] = useState<boolean>(false);

  const toggleCollapse = () => {
    setCollapseOpen(!isCollapseOpen);
  };

  return (
    <StyledCallout intent={intent} onClick={toggleCollapse} icon={icon}>
      <RowFlexContainer>
        <ColumnFlexContainer>
          <StaticSizeDiv>{title}</StaticSizeDiv>
          <StyledCollapse in={isCollapseOpen}>{collapseContent}</StyledCollapse>
        </ColumnFlexContainer>
        {isCollapseOpen ? <StyledArrowUpIcon /> : <StyledArrowDownIcon />}
      </RowFlexContainer>
    </StyledCallout>
  );
}
