import styled from "@emotion/styled";
import {
  Button,
  fontBodyXs,
  getColors,
  getFontWeights,
  getSpacings,
} from "czifui";

export const StyledDateRange = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledManualDate = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      border-bottom: 1px solid ${colors?.gray[200]};
      padding-bottom: ${spacings?.xxs + spacings?.m}px;
      padding-top: ${spacings?.m}px;
      padding-right: ${spacings?.xxs}px;
      padding-left: ${spacings?.xxs}px;
    `;
  }}
`;

export const StyledText = styled.span`
  ${fontBodyXs}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spacings = getSpacings(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin: 0 ${spacings?.xs}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.xs}px;
    `;
  }}
`;
