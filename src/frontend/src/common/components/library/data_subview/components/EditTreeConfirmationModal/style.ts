import styled from "@emotion/styled";
import { fontHeaderXl, getSpaces, ButtonIcon } from "czifui";

export const StyledTitle = styled.div`
  ${fontHeaderXl}
`;

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledIconButton = styled(ButtonIcon)`
  display: flex;
  align-self: flex-end;
  padding: 0;
`;
