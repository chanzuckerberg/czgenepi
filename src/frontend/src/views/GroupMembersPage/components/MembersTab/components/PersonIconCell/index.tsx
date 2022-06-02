import { Icon } from "czifui";
import React from "react";
import { StyledCell } from "./style";

interface Props {
  content: string;
}

const PersonIconCell = ({ content }: Props): JSX.Element => {
  return (
    <StyledCell>
      <Icon sdsIcon="person" sdsSize="xl" sdsType="static" />
      {content}
    </StyledCell>
  );
};

export { PersonIconCell };
