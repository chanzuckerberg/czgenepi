// includes shared styles for icons
import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces, IconButton } from "czifui";

export const iconFillBlack = (): string => {
  return `
    svg {
      fill: black;
    }
  `;
};

export const iconFillError = (props: CommonThemeProps): string => {
  const colors = getColors(props);
  return `
    svg {
      fill: ${colors?.error[400]};
    }
  `;
};

export const iconFillGray = (props: CommonThemeProps): string => {
  const colors = getColors(props);
  return `
    svg {
      fill: ${colors?.gray[500]};
    }
  `;
};

export const iconFillGrayHoverPrimary = (props: CommonThemeProps): string => {
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

export const iconFillWarning = (props: CommonThemeProps): string => {
  const colors = getColors(props);

  return `
    svg {
      fill: ${colors?.warning[600]};
    }
  `;
};

export const iconFillWhite = (): string => {
  return `
    svg {
      fill: white;
    }
  `;
};

export const rightMarginM = (props: CommonThemeProps): string => {
  const spaces = getSpaces(props);
  return `
    margin-right: ${spaces?.m}px;
  `;
};

export const rightMarginXxs = (props: CommonThemeProps): string => {
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
