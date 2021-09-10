import styled from "@emotion/styled";
import { Alert, Button, fontBodyXs, getFontWeights, getSpacings } from "czifui";

export const StyledAlert = styled(Alert)`
  position: absolute;
  z-index: 1;
  box-shadow: 5px 10px;
  width: 360px;
  margin-top: -120px;
  right: 15px;
`;

export const StyledDiv = styled.div`
  ${fontBodyXs}
`;

export const BoldText = styled.div`
  ${fontBodyXs}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
        font-weight: ${fontWeights?.semibold};
      `;
  }}
`;

export const DismissButton = styled(Button)`
  ${fontBodyXs}
  &:hover {
    background-color: transparent;
  }
  ${(props) => {
    const spacings = getSpacings(props);
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-top: ${spacings?.xl}px;
      margin-left: 0px;
      padding-left: 0px;
    `;
  }}
`;
