import styled from "@emotion/styled";
import { CommonThemeProps, fontHeader, getColors, getSpaces } from "czifui";
import { TitleSize } from "./index";

export const Wrapper = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[100]};
      padding: ${spaces?.xl}px;
    `;
  }}
`;

interface TitleProps extends CommonThemeProps {
  titleSize: TitleSize;
}

const doNotForwardProps = ["titleSize"];

export const Title = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: TitleProps) => {
    const { titleSize } = props;
    return fontHeader(titleSize);
  }}

  ${(props: TitleProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;
