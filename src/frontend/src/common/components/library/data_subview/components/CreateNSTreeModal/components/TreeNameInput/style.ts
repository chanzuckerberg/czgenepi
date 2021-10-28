import styled from "@emotion/styled";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import {
  Button,
  fontBodyXs,
  fontCapsXxxs,
  getColors,
  getFontWeights,
  getIconSizes,
  getSpaces,
  Props,
} from "czifui";
import Instructions from "src/components/Instructions";

export const StyledInstructions = styled(Instructions)`
  border-radius: 4px;
  color: black;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
      padding: ${spaces?.l}px;
    `;
  }}
`;

export const InstructionsSemiBold = styled.span`
  color: black;
  ${fontBodyXs}
  ${(props: Props) => {
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

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxxs}
  padding-left: 0px;
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-left: ${spaces?.m}px;
      padding-top: ${spaces?.xxs}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
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
