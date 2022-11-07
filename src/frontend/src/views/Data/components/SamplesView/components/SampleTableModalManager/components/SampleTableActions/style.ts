import styled from "@emotion/styled";
import {
  Chip,
  CommonThemeProps,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";

export const StyledWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const Divider = styled.div`
  height: 28px;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-left: ${spaces?.xl}px;
      border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledSelectedCount = styled.div`
  ${fontHeaderXs}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const fontWeights = getFontWeights(props);

    return `
      margin-left: ${spaces?.m}px;
      font-weight: ${fontWeights?.semibold};
      color: black;
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);

    return `
      background-color: ${colors?.gray[200]};
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const TooltipHeaderText = styled.div`
  color: white;
  text-align: center;
`;

export const TooltipDescriptionText = styled.div`
  text-align: center;

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[400]};
    `;
  }}
`;
