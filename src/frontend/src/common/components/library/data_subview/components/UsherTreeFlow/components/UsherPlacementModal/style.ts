import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import CloseIcon from "@material-ui/icons/Close";
import {
  Button,
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
import {
  StyledDialogContent as DialogContent,
  StyledInfoOutlinedIcon as InfoIcon,
} from "../../../CreateNSTreeModal/style";
import { StyledWarningIcon as WarningIcon } from "../../../FailedSampleAlert/style";

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

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xl}px;
      width: 150px;

      .MuiInputBase-root {
        height: ${INPUT_HEIGHT};
      }
    `;
  }}
`;

export const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledSuggestionText = styled.div`
  ${fontBodyXxxs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.warning[600]};
      margin-left: ${spaces?.s}px;
    `;
  }}
`;

export const StyledWarningIcon = styled(WarningIcon)`
  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.warning[400]};
      margin-top: 0;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const colors = getColors(props);
    return `
      &:active {
        background-color: ${colors?.gray[400]};
      }
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

export const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  cursor: pointer;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[400]};
      right: ${spaces?.xl}px;
      top: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledInfoIcon = styled(InfoIcon)`
  margin-top: 3px;
`;
