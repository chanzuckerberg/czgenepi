import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import {
  fontBodyXs,
  fontHeaderM,
  fontHeaderXs,
  getColors,
  getSpacings,
  List,
  ListItem,
} from "czifui";

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

export const StyledTextField = styled(TextField)`
  width: 150px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.xl}px;
      margin-top: ${spacings?.xs}px;;
    `;
  }}
`;

export const FlexWrapper = styled.div`
  display: flex;
  align-items: center;
`;
