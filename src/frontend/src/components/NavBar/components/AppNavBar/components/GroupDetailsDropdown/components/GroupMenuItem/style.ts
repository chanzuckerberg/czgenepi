import styled from "@emotion/styled";
import {
  ButtonIcon,
  fontBodyXs,
  getColors,
  getFontWeights,
  getSpaces,
  MenuItem as LibMenuItem,
} from "czifui";

export const MenuItem = styled(LibMenuItem)`
  ${fontBodyXs}

  ${(props) => {
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);

    return `
      cursor: pointer;
      padding: ${spaces?.l}px ${spaces?.xl}px;

      .primary-text {
        display: flex;
        font-weight: ${fontWeights?.semibold};
        width: 100%;
      }

      &:hover {
        ${StyledIcon} svg path {
          fill: ${colors?.primary[400]};
        }

        svg path {
          fill: black;
        }
      }
    `;
  }}
`;

export const StyledName = styled.div`
  flex: 1 1 auto;
  display: flex;
  white-space: break-spaces;
`;

export const StyledIcon = styled.span`
  flex: 0 0 auto;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.m}px;
      svg path {
        fill: ${colors?.gray[400]};
      }
    `;
  }}
`;

export const StyledIconButton = styled(ButtonIcon)`
  flex: 0 0 auto;
`;
