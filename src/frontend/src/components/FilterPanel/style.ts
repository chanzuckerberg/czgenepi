import styled from "@emotion/styled";
import {
  Chip,
  ComplexFilter,
  fontCapsXxxs,
  getColors,
  getSpaces,
  InputDropdown,
  Props,
} from "czifui";

export interface ExtraProps extends Props {
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

export const StyledInputDropdown = styled(InputDropdown)`
  ${fontCapsXxxs}
  padding: 0;
  text-align: left;
`;

export const StyledFilterWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.l}px 0;

      &:first-child {
        margin: 0;
      }
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xxs}px ${spaces?.xxs}px 0 0;
    `;
  }}
`;

export const StyledComplexFilter = styled(ComplexFilter)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.l}px 0;
      width: 200px;
      }
    `;
  }}
`;
