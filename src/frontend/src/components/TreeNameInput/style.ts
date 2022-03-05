import styled from "@emotion/styled";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import {
  CommonThemeProps,
  fontBodyXs,
  fontHeaderM,
  getColors,
  getCorners,
  getFontWeights,
  getIconSizes,
  getSpaces,
} from "czifui";
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

export const StyledErrorOutlinedIcon = styled(ErrorOutlineIcon)`
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.error[400]};
      margin-right: ${spaces?.xs}px;
      height: ${iconSizes?.s.height}px;
      width: ${iconSizes?.s.width}px;
    `;
  }}
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
