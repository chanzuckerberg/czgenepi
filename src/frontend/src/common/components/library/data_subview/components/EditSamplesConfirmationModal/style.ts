import styled from "@emotion/styled";
import IconButton from "@material-ui/core/IconButton";
import { fontBodyS, fontBodyXs, getColors, getSpaces } from "czifui";

export const StyledIconButton = styled(IconButton)`
  display: flex;
  align-self: flex-end;
  padding: 0;
  &:hover {
    background-color: transparent;
  }
`;

export const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 0px;
`;

export const StyledPreTitle = styled.span`
  ${fontBodyS}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const StyledSubTitle = styled.span`
  ${fontBodyXs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;
