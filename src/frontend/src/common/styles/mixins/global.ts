import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";
import { NAV_BAR_HEIGHT_PX } from "src/components/NavBar";

export const PageContent = styled.div`
  height: calc(100% - ${NAV_BAR_HEIGHT_PX}px);
`;

export const ContentStyles = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);

  return `
    @media only screen and (min-width: 768px) {
      padding: ${spaces?.xl}px 125px;
    }

    @media only screen and (max-width: 768px) {
      padding: ${spaces?.xl}px;
    }
  `;
};
