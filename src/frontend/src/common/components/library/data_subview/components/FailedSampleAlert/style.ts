import styled from "@emotion/styled";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";
import { fontBodyXxxs, getFontWeights, getIconSizes, getSpaces } from "czifui";

const AlertInstructionsCommon = `
  ${fontBodyXxxs}
  color: black;
`;

export const AlertInstructionsSemiBold = styled.span`
  ${AlertInstructionsCommon}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const AlertInstructionsNotSemiBold = styled.span`
  ${AlertInstructionsCommon}
`;

export const StyledWarningIcon = styled(ErrorOutlineOutlinedIcon)`
  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spacings = getSpaces(props);
    return `
      height: ${iconSizes?.s.height}px;
      width: ${iconSizes?.s.width}px;
      margin-top: ${spacings?.xxs}px;
    `;
  }}
`;
