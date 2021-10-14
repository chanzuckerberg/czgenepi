import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
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
import { StyledWarningIcon as WarningIcon } from "../FailedSampleAlert/style";

const INPUT_HEIGHT = "34px";

export const StyledListItem = styled(ListItem)`
  ${fontBodyXs}
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spacings?.xs}px;
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

export const FieldTitle = styled.div`
  ${fontHeaderM}
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      color: black;
      margin-bottom: ${spacings?.xxs}px;
    `;
  }}
`;

export const FieldTitleSettings = styled.div`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
    `;
  }}
`;

const doNotForwardProps = ["shouldShowWarning"];

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
      margin-top: ${spacings?.xs}px;
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
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-top: ${spacings?.xl}px;
      margin-bottom: ${spacings?.l}px;
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
      margin-bottom: ${spacings?.xl}px;
      width: 100%;
      height: ${INPUT_HEIGHT};
    `;
  }}
`;
