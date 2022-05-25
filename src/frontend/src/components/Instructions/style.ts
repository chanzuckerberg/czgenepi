import styled from "@emotion/styled";
import { fontHeader, getColors, getSpaces } from "czifui";

export const Wrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.gray[100]};
      padding: ${spaces?.xl}px;
    `;
  }}
`;

const doNotForwardProps = ["titleSize"];

export const Title = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props) => {
    const { titleSize } = props;
    return fontHeader(titleSize);
  }}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxs}px;
    `;
  }}
`;
