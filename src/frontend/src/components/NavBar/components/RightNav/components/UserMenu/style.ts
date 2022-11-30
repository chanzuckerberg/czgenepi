import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  getColors,
  getCorners,
  getPalette,
  getSpaces,
} from "czifui";
import { iconFillBlack, iconFillWhite } from "src/common/styles/iconStyle";

export const StyledNavButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const palette = getPalette(props);
    return `
      color: ${palette?.common?.white};
    `;
  }}
`;

export const StyledNavIconWrapper = styled.div`
  ${iconFillWhite}
`;

export const UserMenuButton = styled(Button)`
  height: 34px;
  width: 34px;
  min-width: unset;
  border-radius: 50%;
  ${iconFillWhite}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    const corners = getCorners(props);
    const palette = getPalette(props);

    return `
      border-radius: ${corners?.l};
      padding: ${spaces?.xs};
      background-color: ${colors?.gray[600]};

      &:hover, &:focus {
        background-color: ${colors?.gray[500]};
      }

      &:active {
        svg {
          fill: black;
        }
        background-color: ${palette?.common?.white};
      }

    `;
  }}
`;
