import styled from "@emotion/styled";
import {
  Button,
  fontCapsXxs,
  fontHeaderXl,
  getColors,
  getSpacings,
} from "czifui";
import FilePicker from "src/components/FilePicker";
import { marginBottom } from "../common/style";

export const SemiBold = styled.span`
  font-weight: 600;
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-right: ${spacings?.s}px;
    `;
  }}
`;

export const StyledFilePicker = styled(FilePicker)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-right: ${spacings?.m}px;
      margin-bottom: ${spacings?.s}px;
      margin-top: ${spacings?.xl}px;
    `;
  }}
`;

export const StyledContainerLeft = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: left;
      margin-bottom: ${spacings?.xs};
  `;
  }}
`;

export const StyledContainerSpaceBetween = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: ${spacings?.m};
    `;
  }}
`;

export const StyledInstructionsButton = styled(Button)`
  ${fontCapsXxs}
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-right: ${spacings?.s}px;
      margin-left: ${spacings?.m}px;
      margin-top: ${spacings.s}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const StyledRemoveAllButton = styled(Button)`
  ${fontCapsXxs}
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-right: ${spacings?.s}px;
      margin-left: ${spacings?.s}px;
      &:hover {
        background-color: transparent;
        color: ${colors?.primary[500]};
      }
    `;
  }}
`;

export const StyledUploadCount = styled.span`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
    font-weight: 600;
    display: block;
    margin-bottom: ${spacings?.xl}px;
    margin-top: ${spacings?.xl}px;
    `;
  }}
`;

export const StyledTitle = styled.span`
  ${fontHeaderXl}
`;

export const ContentWrapper = styled.div`
  ${marginBottom}
`;
