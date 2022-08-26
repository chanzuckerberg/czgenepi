import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  fontBodyXxxs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";

export const StyledDateRange = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledManualDate = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      border-bottom: 1px solid ${colors?.gray[200]};
      padding-bottom: ${(spaces?.xxs ?? 0) + (spaces?.m ?? 0)}px;
      padding-top: ${spaces?.m}px;
      padding-right: ${spaces?.xxs}px;
      padding-left: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledText = styled.span`
  ${fontBodyXs}
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin: 0 ${spaces?.xs}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xs}px;
    `;
  }}
`;

export const ErrorMessageHolder = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledErrorMessage = styled.span`
  /* set max-width here so that there's space for both error messages to be present and be spaced appropriately */
  max-width: 159px;
  ${fontBodyXxxs}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.error[600]};
    `;
  }}
`;
