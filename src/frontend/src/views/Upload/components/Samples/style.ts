import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontCapsXxs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";
import FilePicker from "src/components/FilePicker";
import { marginBottom } from "../common/style";

export const SemiBold = styled.span`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);

    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.s}px;
    `;
  }}
`;

export const StyledFilePicker = styled(FilePicker)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.m}px;
      margin-bottom: ${spaces?.s}px;
      margin-top: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledContainerSpaceBetween = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: ${spaces?.m};
    `;
  }}
`;

export const StyledRemoveAllButton = styled(Button)`
  ${fontCapsXxs}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-right: ${spaces?.s}px;
      margin-left: ${spaces?.s}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const StyledUploadCount = styled.span`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
    font-weight: 600;
    display: block;
    margin-bottom: ${spaces?.xl}px;
    margin-top: ${spaces?.xl}px;
    `;
  }}
`;

export const ContentWrapper = styled.div`
  ${marginBottom}
`;
