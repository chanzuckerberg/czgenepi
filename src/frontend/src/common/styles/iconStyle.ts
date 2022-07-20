// includes shared styles for icons
import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces, IconButton } from "czifui";

const iconFillGray = (props: CommonThemeProps) => {
  const colors = getColors(props);
  return `
    svg {
      fill: ${colors?.gray[500]};
    }
  `;
};

const rightMarginM = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    margin-right: ${spaces?.m}px;
  `;
};

export const StyledEditIconWrapper = styled.div`
  ${rightMarginM}

  svg {
    fill: black;
  }
`;

export const IconWrapperGray500 = styled.div`
  ${iconFillGray}
`;

export const StyledTrashIconWrapper = styled.div`
  ${rightMarginM}

  ${(props) => {
    const colors = getColors(props);
    return `
      svg {
        fill: ${colors?.error[400]};
      }
    `;
  }}
`;

export const StyledTreeIconWrapper = styled.div`
  ${iconFillGray}
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.l}px;
    `;
  }}
`;

export const InfoIconWrapper = styled.div`
  ${iconFillGray}
  ${(props) => {
    const colors = getColors(props);
    return `
      :hover {
        svg {
          fill: ${colors?.primary[400]};
        }
      }
    `;
  }}
`;

export const StyledCloseIconButton = styled(IconButton)`
  float: right;
`;
