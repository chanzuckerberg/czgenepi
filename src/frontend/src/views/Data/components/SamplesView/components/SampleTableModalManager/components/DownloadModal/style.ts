import styled from "@emotion/styled";
import {
  Callout,
  CommonThemeProps,
  fontBodyM,
  fontBodyS,
  fontBodyXs,
  fontBodyXxs,
  fontHeaderXl,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";

export const Header = styled.div`
  ${fontHeaderXl}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  ${fontBodyS}
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;

export const Title = styled.span`
  ${fontBodyM}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const Container = styled.ul`
  list-style-type: none;
  display: grid;
  padding: 0;
  margin: 0;
`;

export const AlertStrong = styled.span`
  ${fontBodyXs}
  color: black;

  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const AlertBody = styled.span`
  ${fontBodyXxs}
  width: 400px;
`;

export const TooltipHeaderText = styled.div`
  text-align: center;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);
    return `
      color: ${colors?.gray[600]};
      font-weight: ${fontWeights?.semibold};
  `;
  }}
`;

export const TooltipDescriptionText = styled.div`
  text-align: center;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[600]};
  `;
  }}
`;

export const StyledCallout = styled(Callout)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      width: 100%;
    `;
  }}
`;
