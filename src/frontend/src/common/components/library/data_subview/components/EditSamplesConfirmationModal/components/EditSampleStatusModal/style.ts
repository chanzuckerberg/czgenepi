import styled from "@emotion/styled";
import {
  Button,
  Dialog,
  fontBodyM,
  fontHeaderXl,
  getColors,
  getShadows,
  getSpaces,
} from "czifui";

export const StyledDialog = styled(Dialog)`
  ${(props) => {
    const colors = getColors(props);
    const shadows = getShadows(props);

    return `
      [role="dialog"] {
        justify-content: center;
        box-shadow: ${shadows?.l};
        border: 1px solid ${colors?.gray[100]};
      }
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      position: absolute;
      top: ${spaces?.xl}px;
      right: ${spaces?.xl}px;
    `;
  }}
`;

export const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledTitle = styled.div`
  ${fontHeaderXl}
`;

export const StyledSubtitle = styled.div`
  ${fontBodyM}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.s}px;
      margin-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledImg = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      width: 150px;
      height: 150px;
      margin-bottom: ${spaces?.xxxs}px;
      path {
        fill: ${colors?.primary[400]};
      }
    `;
  }}
`;

export const StyledButton = styled(Button)`
  width: 184px;
`;
