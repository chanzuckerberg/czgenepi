// includes shared styles for icons
import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces, IconButton } from "czifui";

export const iconFillBlack = () => {
  return `
    svg {
      fill: black;
    }
  `;
};

export const iconFillError = (props: CommonThemeProps) => {
  const colors = getColors(props);
  return `
    svg {
      fill: ${colors?.error[400]};
    }
  `;
};

export const iconFillGray = (props: CommonThemeProps) => {
  const colors = getColors(props);
  return `
    svg {
      fill: ${colors?.gray[500]};
    }
  `;
};

export const iconFillGrayHoverPrimary = (props: CommonThemeProps) => {
  const colors = getColors(props);
  return `
    ${iconFillGray}
    :hover {
      svg {
        fill: ${colors?.primary[400]};
      }
    }
  `;
};

export const iconFillWarning = (props: CommonThemeProps) => {
  const colors = getColors(props);

  return `
    svg {
      fill: ${colors?.warning[600]};
    }
  `;
};

export const iconFillWhite = () => {
  return `
    svg {
      fill: white;
    }
  `;
};

export const rightMarginM = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    margin-right: ${spaces?.m}px;
  `;
};

export const rightMarginXxs = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    margin-right: ${spaces?.xxs}px;
  `;
};

// Dialog Icon styles
export const StyledCloseIconButton = styled(IconButton)`
  float: right;
`;

export const StyledCloseIconWrapper = styled.div`
  ${iconFillGray}
`;
