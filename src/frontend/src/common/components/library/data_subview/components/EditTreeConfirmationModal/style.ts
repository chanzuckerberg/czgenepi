import styled from "@emotion/styled";
import IconButton from "@material-ui/core/IconButton";
import { fontHeaderXl, getSpaces } from "czifui";

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

export const StyledIconButton = styled(IconButton)`
  display: flex;
  align-self: flex-end;
  padding: 0;
  &:hover {
    background-color: transparent;
  }
`;
