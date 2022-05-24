import styled from "@emotion/styled";
import {
  Callout,
  DialogContent,
  fontBodyXxs,
  fontHeaderXl,
  getColors,
  getFontWeights,
  getSpaces,
  InputText,
} from "czifui";
import Instructions from "src/components/Instructions";

export const StyledInputText = styled(InputText)`
  margin-right: 0;
  height: 70px;

  div,
  textarea {
    width: 100%;
  }
`;

export const SmallText = styled.span`
  ${fontBodyXxs}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[600]};
      margin-top: ${spaces?.s}px;
    `;
  }}
`;

export const StyledSpan = styled.span`
  ${fontHeaderXl}

  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.regular};
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledDialogContent = styled(DialogContent)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      label {
        margin-bottom: ${spaces?.s}px;
        margin-top: ${spaces?.l}px;
      }
    `;
  }}
`;

export const StyledInstructions = styled(Instructions)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
    `;
  }}
`;
