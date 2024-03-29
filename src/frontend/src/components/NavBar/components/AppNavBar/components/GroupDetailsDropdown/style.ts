import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  fontHeaderXl,
  getColors,
  getCorners,
  getShadows,
  getSpaces,
  Menu,
} from "czifui";

export const Dropdown = styled(Menu)`
  ${(props: CommonThemeProps) => {
    const corners = getCorners(props);
    const shadows = getShadows(props);

    return `
      .MuiMenu-paper {
        border-radius: ${corners?.m}px;
        box-shadow: ${shadows?.m};
        padding: 0;
        width: 345px;
      }
    `;
  }}
`;

export const GroupList = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      border-top: 2px solid ${colors?.gray[200]};
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

export const GroupName = styled.div`
  ${fontHeaderXl}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const Details = styled.div`
  ${fontBodyXs}

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      display: flex;
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xl}px;
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const StyledIcon = styled.span`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.m}px;
      svg {
        path {
          fill: ${colors?.gray[300]};
        }
      }
    `;
  }}
`;

export const CurrentGroup = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xl}px;
    `;
  }}
`;
