import styled from "@emotion/styled";
import {
  Dropdown,
  DropdownPopper,
  fontHeaderXs,
  getColors,
  getSpaces,
  InputDropdown,
} from "czifui";
import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";

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

export const StyledInputDropdown = styled(InputDropdown)`
  width: 200px;
`;

const DROPDOWN_WIDTH = "200px";

// High specificity label styling is to beat out czifui coloring.
// Might be possible to do by passing a `styled` InputDropdownComponent
// to Dropdown, but might also not be. I think the czifui coloring we are
// trying to beat here might be a bug though, so I think this is the better
// way for now. I (Vince) will write up an issue April 14, 2022.
export const StyledDropdown = styled(Dropdown)`
  width: ${DROPDOWN_WIDTH};
  .MuiButton-label > span {
    color: black;
  }
` as typeof Dropdown; // assert b/c `styled` causes an interface hiccup;

// DropdownPopper (for use with Dropdown's PopperComponent prop) needs to
// have a `placement` prop to set where it anchors against Dropdown opener.
const ConfiguredDropdownPopper = (props: any) => {
  return <DropdownPopper placement="bottom-start" {...props} />;
};
// See ConfiguredDropdownPopper for more info about placement in Dropdown
// The `min-width` property is necessary to cancel out a hardcoded czifui
// value since we want to set a smaller `width` than that hardcoded number
export const StyledDropdownPopper = styled(ConfiguredDropdownPopper)`
  min-width: auto;
  width: ${DROPDOWN_WIDTH};
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xs}px;
    `;
  }}
`;
