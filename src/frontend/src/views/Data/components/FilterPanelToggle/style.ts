import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { fontHeaderXxxs, getColors, getCorners, getSpacings } from "czifui";

export const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  align-content: center;
  height: 42px;
  cursor: pointer;
  position: relative;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin: ${spacings?.s}px ${spacings?.l}px;
    `;
  }}

  :active {
    ${(props) => {
      const colors = getColors(props);

      return `
        path {
          fill: ${colors?.primary[600]};
        }
      `;
    }}
  }
`;

export const StyledBadge = styled.div`
  ${fontHeaderXxxs}

  align-items: center;
  display: flex;
  height: 18px;
  justify-content: center;
  position: absolute;
  right: -12px;
  top: 0;
  width: 18px;

  ${(props) => {
    const colors = getColors(props);
    const corners = getCorners(props);

    return `
      background-color: ${colors?.gray[200]};
      border-radius: ${corners?.l}px;
      color: ${colors?.primary[400]};
    `;
  }}
`;

// TODO (mlila): get these spacings from czifui
export const tooltipStyles = css`
  margin: 0;
  padding: 8px 14px !important;
`;
