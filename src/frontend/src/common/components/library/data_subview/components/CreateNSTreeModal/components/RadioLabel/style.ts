import styled from "@emotion/styled";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import {
  fontBodyXxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";
import IconCheckSmall from "src/common/icons/IconCheckSmall.svg";
import IconCloseSmall from "src/common/icons/IconCloseSmall.svg";

export const Label = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const LabelMain = styled.span`
  ${fontHeaderXs}
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

export const LabelLight = styled.span`
  ${fontHeaderXs}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      font-weight: ${fontWeights?.regular};
      margin-top: ${spaces?.l}px;
      margin-right: ${spaces?.m}px;
      margin-bottom: ${spaces?.xxxs}px;
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const StyledList = styled.ul`
  padding: 0;
  margin: 0;
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

const smallIconSize = `
  width: 14px;
  height: 14px;
  transform: scale(0.7);
`;

export const StyledIconCheckSmall = styled(IconCheckSmall)`
  ${smallIconSize}
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.primary[400]};
    `;
  }}
`;

export const StyledIconXSmall = styled(IconCloseSmall)`
  ${smallIconSize}
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.error[400]};
    `;
  }}
`;
