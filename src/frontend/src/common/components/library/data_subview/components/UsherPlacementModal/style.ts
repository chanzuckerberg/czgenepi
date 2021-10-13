import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import {
  fontBodyXs,
  fontBodyXxxs,
  fontHeaderM,
  fontHeaderXs,
  getColors,
  getSpacings,
  List,
  ListItem,
} from "czifui";
import { StyledWarningIcon as WarningIcon } from "../FailedSampleAlert/style";

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
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
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

const doNotForwardProps = ["showWarning"];

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  width: 150px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xxs}px;
      margin-top: ${spacings?.xs}px;
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
