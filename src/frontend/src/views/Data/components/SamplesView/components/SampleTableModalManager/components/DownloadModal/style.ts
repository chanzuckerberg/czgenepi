import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyM,
  fontBodyS,
  fontHeaderXl,
  getColors,
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

export const TooltipHeaderText = styled.div`
  color: white;
  text-align: center;
`;

export const TooltipDescriptionText = styled.div`
  text-align: center;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[400]};
  `;
  }}
`;
