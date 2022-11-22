import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
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
  Tooltip,
} from "czifui";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import {
  iconFillGrayHoverPrimary,
  iconFillWarning,
} from "src/common/styles/iconStyle";

const INPUT_HEIGHT = "34px";

export const Title = styled.span`
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDialogTitle = styled(DialogTitle)`
  flex: 0 0 auto;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDialogContent = styled(DialogContent)`
  ${fontBodyS}

  overflow-y: auto;
  & > div:last-child {
    margin-bottom: 0;
  }

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      color: ${colors?.gray[500]};
      padding-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledListItem = styled(ListItem)`
  &.MuiListItem-root {
    ${fontBodyXs}
  }

  ${(props: CommonThemeProps) => {
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
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledSectionHeader = styled.div`
  ${fontHeaderM}
  ${(props: CommonThemeProps) => {
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

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledTextField = styled.div`
  ${(props: CommonThemeProps) => {
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

  ${(props: CommonThemeProps) => {
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
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props: CommonThemeProps) => {
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
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
      width: 100%;
      height: ${INPUT_HEIGHT};
    `;
  }}
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
  margin-top: 3px;
`;

export const Content = styled.div`
  ${fontBodyS}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const StyledWarningIconWrapper = styled.div`
  ${iconFillWarning}
`;

export const TreeNameInfoWrapper = styled.div`
  display: flex;
  align-items: center;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const StyledTooltip = styled(Tooltip)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;
