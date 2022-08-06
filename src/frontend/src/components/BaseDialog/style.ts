import styled from "@emotion/styled";
import IconButton from "@mui/material/IconButton";
import {
  fontBodyS,
  fontBodyXxs,
  fontHeaderL,
  getColors,
  getSpaces,
} from "czifui";
import { narrow } from "src/common/components/library/Dialog/components/common";

export const Title = styled.div`
  ${fontHeaderL}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const Content = styled.div`
  ${fontBodyS}
`;

export const StyledFooter = styled.div`
  ${fontBodyXxs}
  ${narrow}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      padding: 0 ${spaces?.xxl}px ${spaces?.xxl}px ${spaces?.xxl}px;
      margin: -${(spaces?.s || 0) + (spaces?.xl || 0)}px 0 0 0;
    `;
  }}
`;

export const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 0px;
`;

export const StyledIconButton = styled(IconButton)`
  display: flex;
  flex-direction: column;
  align-self: flex-end;
  padding: 0;
  &:hover {
    background-color: transparent;
  }
`;
