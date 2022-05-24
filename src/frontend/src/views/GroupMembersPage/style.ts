import styled from "@emotion/styled";
import { fontHeaderXxl, getSpaces } from "czifui";
import { ContentStyles, PageContent } from "src/common/styles/mixins/global";

export const StyledHeader = styled.div`
  ${fontHeaderXxl}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xl}px 0;
    `;
  }}
`;

export const StyledPageContent = styled(PageContent)`
  ${ContentStyles}
`;
