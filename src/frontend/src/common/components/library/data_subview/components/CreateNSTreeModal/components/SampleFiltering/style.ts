import styled from "@emotion/styled";
import {
  CommonThemeProps,
  Dropdown,
  DropdownPopper,
  fontHeaderXs,
  getColors,
  getPalette,
  getSpaces,
} from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { iconFillGrayHoverPrimary } from "src/common/styles/iconStyle";

export const StyledContainer = styled.div`
  ${(props: CommonThemeProps) => {
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
  flex-wrap: wrap;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const StyledFilterGroup = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledFilterGroupName = styled.p`
  ${fontHeaderXs}
  color: black;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
`;

export const StyledNewTabLink = styled(NewTabLink)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      &:hover {
        color: ${colors?.primary[600]};
        text-decoration: none;
      }
    `;
  }}
`;

export const DROPDOWN_WIDTH = "204px";

export const StyledDropdown = styled(Dropdown)`
  width: ${DROPDOWN_WIDTH};

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const palette = getPalette(props);
    return `
      border-color: ${colors?.gray[500]};
      path {
        fill: ${colors?.gray[500]};
      }
      span {
        color: ${palette?.common?.black};
      }

      &:hover {
        border-color: ${colors?.gray[600]};
        path {
          fill: ${colors?.gray[600]};
        }
      }
    `;
  }}
`;

// The `min-width` property is necessary to cancel out a hardcoded czifui
// value since we want to set a smaller `width` than that hardcoded number
export const StyledDropdownPopper = styled(DropdownPopper)`
  min-width: auto;
  width: ${DROPDOWN_WIDTH};
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xs}px;
    `;
  }}
`;
