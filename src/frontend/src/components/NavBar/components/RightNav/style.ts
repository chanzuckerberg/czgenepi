import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  getColors,
  getPalette,
  getSpaces,
} from "czifui";
import { srOnly } from "src/common/styles/mixins/accessibility";

const whiteBorder = "border: 1px solid white;";
export const UploadButton = styled(Button)`
  color: white;
  ${whiteBorder}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-right: ${spaces?.xl}px;

      &:hover {
        ${whiteBorder}
        color: black;
        background-color: white;
      }

      &:active {
        background-color: ${colors?.gray[200]};
      }
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${fontBodyXs}

  display: flex;
  justify-content: flex-end;
  flex: auto;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.l}px;
    `;
  }}
`;

export const StyledLink = styled.a`
  display: flex;
  align-items: center;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xxxs}px;
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledIconWrapper = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const palette = getPalette(props);

    return `
      svg {
        fill: ${colors?.gray[300]};
        &:hover, &:focus, &:active {
          fill: ${palette?.common?.white}
        }
      }
    `;
  }}
`;

export const HiddenLabel = styled.label`
  ${srOnly}
`;
