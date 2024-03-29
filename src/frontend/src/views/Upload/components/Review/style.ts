import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  fontHeaderL,
  fontHeaderXs,
  getColors,
  getSpaces,
  InputCheckbox,
} from "czifui";
import { marginBottom } from "../common/style";

export const ContentTitle = styled.span`
  ${fontHeaderL}
`;

export const ContentTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledCheckbox = styled(InputCheckbox)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: 0;
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const CheckboxText = styled.div`
  ${fontBodyXs}

  display: flex;
  align-items: flex-start;

  &:hover {
    cursor: pointer;
  }

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.m}px;
    `;
  }}
`;

export const CheckboxWrapper = styled.div`
  ${marginBottom}
`;

export const StyledButton = styled(Button)`
  ${fontHeaderXs}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.primary[400]};
      padding: ${spaces?.xs}px ${spaces?.s}px;
      text-transform: none;

      &:hover, &:focus {
        background-color: ${colors?.primary[200]};
        color: ${colors?.primary[400]};
      }
    `;
  }}
`;
