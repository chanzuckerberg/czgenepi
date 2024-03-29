import styled from "@emotion/styled";
import {
  Callout,
  CommonThemeProps,
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
  margin: 0;
  min-height: 70px;
  height: auto;

  div {
    width: 100%;
  }

  /* MUI has a really specific selector for resize on this input, for some reason */
  textarea.MuiInputBase-input.MuiInputBase-inputMultiline {
    width: 100%;
    resize: vertical;
  }
`;

export const SmallText = styled.span`
  ${fontBodyXxs}
  ${(props: CommonThemeProps) => {
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

  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.regular};
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledDialogContent = styled(DialogContent)`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);

    return `
      label {
        font-weight: ${fontWeights?.semibold};
        margin-bottom: ${spaces?.s}px;
        margin-top: ${spaces?.l}px;
      }
    `;
  }}
`;

export const StyledInstructions = styled(Instructions)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
    `;
  }}
`;
