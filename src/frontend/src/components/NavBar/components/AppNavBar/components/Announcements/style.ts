import styled from "@emotion/styled";
import { Banner, getSpaces } from "czifui";

export const StyledBanner = styled(Banner)`
  text-align: center;

  > :first-child {
    ${(props) => {
      const spaces = getSpaces(props);
      return `
        margin: 0 ${spaces?.m}px;
      `;
    }}
  }

  /* media query - if less than 1490px wide, show on two lines */
  @media (max-width: 1490px) {
    height: 60px;
  }

  @media (max-width: 790px) {
    height: 90px;
  }
`;
