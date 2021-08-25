import styled from "@emotion/styled";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {
  fontBodyXxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpacings,
} from "czifui";
import IconCheckSmall from "./IconCheckSmall.svg";
import IconCloseSmall from "./IconCloseSmall.svg";

export const Label = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const LabelMain = styled.span`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.l}px;
      margin-right: ${spacings?.m}px;
      margin-bottom: ${spacings?.xxxs}px;
    `;
  }}
`;

export const LabelLight = styled.span`
  ${fontHeaderXs}
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      margin-top: ${spacings?.l}px;
      margin-right: ${spacings?.m}px;
      margin-bottom: ${spacings?.xxxs}px;
      color: ${colors?.gray[300]};
    `;
  }}
`;

export const StyledListItem = styled(ListItem)`
  ${fontBodyXxs}
  display: flex;
  align-items: flex-start;
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spacings = getSpacings(props);
    return `
      font-weight: ${fontWeights?.regular};
      padding: ${spacings?.xxxs}px;
    `;
  }}
`;

export const StyledListItemIcon = styled(ListItemIcon)`
  min-width: 32px;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.s}px;
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-top: ${spacings?.m}px;
    `;
  }}
`;

export const StyledIconCheckSmall = styled(IconCheckSmall)`
  width: 14px;
  height: 14px;
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.primary[400]};
    `;
  }}
`;

export const StyledIconXSmall = styled(IconCloseSmall)`
  width: 14px;
  height: 14px;
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.error[400]};
    `;
  }}
`;
