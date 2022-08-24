import styled from "@emotion/styled";
import { CommonThemeProps, ComplexFilter, getColors, getSpaces } from "czifui";

export interface ExtraProps extends CommonThemeProps {
  isOpen?: boolean;
}

// * Please keep this in sync with the props used in `ExtraProps`
const doNotForwardProps = ["isOpen"];

export const StyledFilterPanel = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const { isOpen } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      border-right: ${spaces?.xxxs}px ${colors?.gray[200]} solid;
      display: ${isOpen ? "block" : "none"};
      padding: ${spaces?.xl}px;
      width: 240px;
    `;
  }}
`;

export const StyledComplexFilter = styled(ComplexFilter)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.l}px 0;
      width: 200px;
      }
    `;
  }}
`;
