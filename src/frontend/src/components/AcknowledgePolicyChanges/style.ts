import styled from "@emotion/styled";
import { fontHeaderXs, getColors, getSpacings, getIconSizes } from "czifui";
import IconInfo from "src/common/icons/IconInfo.svg"

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      background-color: ${colors?.primary[400]};
      padding: 0 ${spacings?.l}px;
    `;
  }}
`;

export const StyledIconInfo = styled(IconInfo)`
  fill: white;
  vertical-align: middle;
  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spacings = getSpacings(props);
    console.log(iconSizes);
    return `
      width: ${iconSizes?.l.width}px;
      height: ${iconSizes?.l.height}px;
      margin-right: ${spacings?.m}px;
    `;
  }}
`;
