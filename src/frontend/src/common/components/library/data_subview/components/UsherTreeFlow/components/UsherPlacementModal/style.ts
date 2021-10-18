import styled from "@emotion/styled";
import { Dialog } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import CloseIcon from "@material-ui/icons/Close";
import {
  Button,
  fontBodyXs,
  fontBodyXxxs,
  fontHeaderM,
  fontHeaderXs,
  getColors,
  getSpacings,
  InputDropdown,
  List,
  ListItem,
} from "czifui";
import { StyledDialogContent as DialogContent } from "../../../CreateNSTreeModal/style";
import { StyledWarningIcon as WarningIcon } from "../../../FailedSampleAlert/style";

const INPUT_HEIGHT = "34px";

export const StyledDialogContent = styled(DialogContent)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledListItem = styled(ListItem)`
  &.MuiListItem-root {
    ${fontBodyXs}
  }

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spacings?.xs}px;

      &:last-of-type {
        margin-bottom: 0;
      }
    `;
  }}
`;

export const StyledList = styled(List)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xl}px;
    `;
  }}
`;

export const StyledSectionHeader = styled.div`
  ${fontHeaderM}
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      color: black;
      margin-bottom: ${spacings?.m}px;
    `;
  }}
`;

export const StyledFieldTitleText = styled.div`
  ${fontHeaderXs}
  color: black;
  display: flex;
  align-items: center;

  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xs}px;
    `;
  }}
`;

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xl}px;
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
    const spacings = getSpacings(props);

    return `
      color: ${colors?.warning[600]};
      margin-left: ${spacings?.s}px;
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
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.l}px;
      width: 100%;
      height: ${INPUT_HEIGHT};
    `;
  }}
`;

// TODO (mlila): this can be removed when we are on czifui version 1.1.2 or higher
export const StyledDialog = styled(Dialog)`
  + [role="tooltip"] {
    z-index: 1400;
  }
`;

export const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  cursor: pointer;

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);

    return `
      color: ${colors?.gray[400]};
      right: ${spacings?.xl}px;
      top: ${spacings?.xl}px;
    `;
  }}
`;
