import styled from "@emotion/styled";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import {
  fontBodyXs,
  getColors,
  getFontWeights,
  getIconSizes,
  getSpaces,
  Props,
} from "czifui";

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
