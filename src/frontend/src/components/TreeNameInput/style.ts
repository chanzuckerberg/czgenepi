import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  fontHeaderM,
  getCorners,
  getFontWeights,
  getSpaces,
} from "czifui";
import { ErrorIconWrapper } from "src/common/styles/iconStyle";
import Instructions from "src/components/Instructions";

export const StyledInstructions = styled(Instructions)`
  ${(props) => {
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

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xl}px;
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const StyledErrorIconWrapper = styled(ErrorIconWrapper)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;
