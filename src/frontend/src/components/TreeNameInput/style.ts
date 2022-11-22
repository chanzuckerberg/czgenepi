import styled from "@emotion/styled";
import { TextField } from "@mui/material";
import {
  CommonThemeProps,
  fontBodyXs,
  fontBodyXxxs,
  fontHeaderM,
  getColors,
  getCorners,
  getFontWeights,
  getSpaces,
} from "czifui";
import { iconFillError } from "src/common/styles/iconStyle";
import Instructions from "src/components/Instructions";

export const StyledInstructions = styled(Instructions)`
  ${(props: CommonThemeProps) => {
    const corners = getCorners(props);
    const spaces = getSpaces(props);

    return `
      border-radius: ${corners?.m}px;
      padding:${spaces?.l}px ${spaces?.l}px ${spaces?.s}px ${spaces?.l}px;
    `;
  }}
`;

export const InstructionsSemiBold = styled.span`
  color: black;
  ${fontBodyXs}
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-bottom: ${spaces?.xxxs};
    `;
  }}
`;

export const InstructionsNotSemiBold = styled.span`
  color: black;
  ${fontBodyXs}
`;

export const TextInputLabelTitle = styled.div`
  ${fontHeaderM}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xl}px;
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const StyledErrorIconWrapper = styled.div`
  ${iconFillError}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledTextField = styled(TextField)`
  color: black;
  padding: 0px;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const TreeNameTooLongAlert = styled.div`
  ${fontBodyXxxs}
  display: flex;
  align-items: center;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxxs}px;
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const TextFieldAlert = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.error[400]};
    `;
  }}
`;
