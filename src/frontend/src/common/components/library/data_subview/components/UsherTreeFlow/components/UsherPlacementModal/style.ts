import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  fontBodyS,
  fontBodyXs,
  fontBodyXxxs,
  fontHeaderM,
  fontHeaderXs,
  getColors,
  getSpaces,
  InputDropdown,
  List,
  ListItem,
} from "czifui";
import { InfoIconWrapper } from "src/common/styles/iconStyle";
import { StyledDialogContent as DialogContent } from "../../../CreateNSTreeModal/style";

const INPUT_HEIGHT = "34px";

export const StyledDialogContent = styled(DialogContent)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledListItem = styled(ListItem)`
  &.MuiListItem-root {
    ${fontBodyXs}
  }

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spaces?.xs}px;

      &:last-of-type {
        margin-bottom: 0;
      }
    `;
  }}
`;

export const StyledList = styled(List)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledSectionHeader = styled.div`
  ${fontHeaderM}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      color: black;
      margin-bottom: ${spaces?.m}px;
    `;
  }}
`;

export const StyledFieldTitleText = styled.div`
  ${fontHeaderXs}
  color: black;
  display: flex;
  align-items: center;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledTextField = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xl}px;

      .MuiInputBase-root {
        height: ${INPUT_HEIGHT};
        width: 150px;
      }
    `;
  }}
`;

const flex = () => {
  return css`
    display: flex;
    align-items: center;
  `;
};

export const FlexWrapper = styled.div`
  ${flex}
`;

export const StyledSuggestionText = styled.div`
  ${fontBodyXxxs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.warning[600]};
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledSuggestionWrapper = styled.div`
  ${flex}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      &:active {
        background-color: ${colors?.gray[400]};
      }

      margin-top: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledInputDropdown = styled(InputDropdown)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
      width: 100%;
      height: ${INPUT_HEIGHT};
    `;
  }}
`;

export const StyledInfoIconWrapper = styled(InfoIconWrapper)`
  margin-top: 3px;
`;

export const Content = styled.div`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
