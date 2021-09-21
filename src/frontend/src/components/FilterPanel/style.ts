import styled from "@emotion/styled";
import {
  Chip,
  fontCapsXxxs,
  getColors,
  getSpacings,
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
    const spacings = getSpacings(props);
    return `
      border-right: ${spacings?.xxxs}px ${colors?.gray[200]} solid;
      display: ${isOpen ? "block" : "none"};
      padding: ${spacings?.xl}px;
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
    const spacings = getSpacings(props);
    return `
      margin: ${spacings?.l}px 0;

      &:first-child {
        margin: 0;
      }
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin: ${spacings?.xxs}px ${spacings?.xxs}px 0 0;
    `;
  }}
`;
