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

// Icon Wrappers change icon colors. Additional attributes can be added in other styled components.
export const ErrorIconWrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);

    return `
      svg {
        fill: ${colors?.error[400]};
      }
    `;
  }}
`;

export const IconWrapperGray500 = styled.div`
  ${iconFillGray}
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

export const NavIconWrapper = styled.div`
  svg {
    fill: white;
  }
`;

export const WarningIconWrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);

    return `
      svg {
        fill: ${colors?.warning[600]};
      }
    `;
  }}
`;

// Styled Icon Wrappers include attributes other than color, i.e. spacing
export const StyledEditIconWrapper = styled.div`
  ${rightMarginM}

  svg {
    fill: black;
  }
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

// Keeping IconButton style in here for now. May need to move if there are
// more IconButton styles in the future.
export const StyledCloseIconButton = styled(IconButton)`
  float: right;
`;
