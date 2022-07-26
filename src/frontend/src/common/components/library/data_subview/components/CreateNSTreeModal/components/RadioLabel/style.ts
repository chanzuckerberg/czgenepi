import styled from "@emotion/styled";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { fontBodyXxs, fontHeaderS, getFontWeights, getSpaces } from "czifui";

export const Label = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const LabelMain = styled.span`
  ${fontHeaderS}
  color: black;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      margin-right: ${spaces?.xxs}px;
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const StyledList = styled.ul`
  padding: 0;
  margin: 0;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      margin-left: ${spaces?.xxxs}px;
    `;
  }}
`;

export const StyledListItem = styled.li`
  color: black;
  display: flex;
  align-items: flex-start;
  padding: 0px;
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);
    return `
      font-weight: ${fontWeights?.regular};
      padding-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const SmallText = styled.span`
  ${fontBodyXxs}
`;

export const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 24px;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.s}px;
    `;
  }}
`;

export const StyledListItemCloseIcon = styled(StyledListItemIcon)`
  svg {
    fill: red;
  }
`;
