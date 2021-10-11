import styled from "@emotion/styled";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";
import {
  fontBodyXxxs,
  getFontWeights,
  getIconSizes,
  getSpacings,
} from "czifui";

const AlertInstructionsCommon = `
  ${fontBodyXxxs}
  color: black;
`;

export const AlertInstructionsSemiBold = styled.span`
  ${AlertInstructionsCommon}
  ${(props: Props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const AlertInstructionsNotSemiBold = styled.span`
  ${AlertInstructionsCommon}
`;

export const StyledWarningIcon = styled(ReportProblemOutlinedIcon)`
  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spacings = getSpacings(props);
    return `
      height: ${iconSizes?.s.height}px;
      width: ${iconSizes?.s.width}px;
      margin-top: ${spacings?.xxs}px;
    `;
  }}
`;
