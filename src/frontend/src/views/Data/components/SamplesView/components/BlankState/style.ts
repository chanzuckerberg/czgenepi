import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontBodyM,
  fontHeaderM,
  fontHeaderXl,
  getSpaces,
  Icon,
  Link,
} from "czifui";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-self: center;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xl}px;
    `;
  }}
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 240px;
`;

const marginBottomL = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    margin-bottom: ${spaces?.l}px;
  `;
};

export const Header = styled.h1`
  ${fontHeaderXl}
  ${marginBottomL}
`;

export const BodyText = styled.p`
  ${fontBodyM}
  ${marginBottomL}
  margin-top: 0;
`;

export const StyledLink = styled(Link)`
  display: flex;
  flex-direction: row;
  cursor: pointer;
`;

export const StyledButtonLink = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: 0;
      margin: ${spaces?.l}px 0;
      justify-content: flex-start;

      &:hover {
        background-color: unset;
        text-decoration: underline;
      }
    `;
  }}
`;

export const StyledLinkText = styled.p`
  margin: 0;
  ${fontHeaderM}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.xs}px;
    `;
  }}
`;

export const StyledLinkIcon = styled(Icon)`
  align-self: center;
`;
