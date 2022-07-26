import styled from "@emotion/styled";
import {
  Dropdown,
  DropdownPopper,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { iconFillGrayHoverPrimary } from "src/common/styles/iconStyle";

export const StyledContainer = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledExplainerTitle = styled.div`
  ${fontHeaderXs}
  display: flex;
  align-items: center;
  color: black;
`;

export const StyledFiltersSection = styled.div`
  display: flex;
  flex-direction: row;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const StyledFilterGroup = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledFilterGroupName = styled.p`
  ${fontHeaderXs}
  color: black;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
`;

export const StyledNewTabLink = styled(NewTabLink)`
  ${(props) => {
    const colors = getColors(props);

    return `
      &:hover {
        color: ${colors?.primary[600]};
        text-decoration: none;
      }
    `;
  }}
`;

const DROPDOWN_WIDTH = "209px";

// High specificity label styling is to beat out czifui coloring.
export const StyledDropdown = styled(Dropdown)`
  width: ${DROPDOWN_WIDTH};
  .MuiButton-label > span {
    color: black;
  }

  ${(props) => {
    const colors = getColors(props);
    return `
      path {
        fill: ${colors?.gray[500]};
      }
    `;
  }}
` as typeof Dropdown; // assert b/c `styled` causes an interface hiccup;

// The `min-width` property is necessary to cancel out a hardcoded czifui
// value since we want to set a smaller `width` than that hardcoded number
export const StyledDropdownPopper = styled(DropdownPopper)`
  min-width: auto;
  width: ${DROPDOWN_WIDTH};
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xs}px;
    `;
  }}
`;
