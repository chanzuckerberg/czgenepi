import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  fontCapsXxxxs,
  fontHeaderL,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";

export const Title = styled.span`
  ${fontHeaderL}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.s}px;
    `;
  }}
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.s}px;
    `;
  }}
`;

export const IntroWrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const Wrapper = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxl}px;
    `;
  }}
`;

export const StyledUpdatedDate = styled.p`
  ${fontCapsXxxxs}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${fontBodyXs}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.primary[400]};
      font-weight: ${fontWeights?.semibold};
      padding: ${spaces?.xs}px ${spaces?.s}px;

      &:hover, &:focus {
        background-color: ${colors?.primary[200]};
        color: ${colors?.primary[400]};
      }
    `;
  }}
`;

export const VerticalLine = styled.div`
  height: 100%;
  width: 1px;
  margin: 0;

  &:before {
    content: "\\00a0";
  }

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.gray[400]};
    `;
  }}
`;
