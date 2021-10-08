import styled from "@emotion/styled";
import { Dialog } from "@material-ui/core";
import { fontHeaderXl, getColors, getSpacings } from "czifui";
import { P } from "src/common/styles/support/style";

export const StyledDialog = styled(Dialog)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      .MuiDialog-paper {
        padding: ${spacings?.xxl}px;
        max-width: 400px;
      }
    `;
  }}
`;

export const StyledTitle = styled.div`
  ${fontHeaderXl}

  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.m}px;
      margin-top: ${spacings?.l}px;
    `;
  }}
`;

export const StyledP = styled(P)`
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
