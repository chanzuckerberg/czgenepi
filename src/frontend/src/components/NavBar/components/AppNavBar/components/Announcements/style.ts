import styled from "@emotion/styled";
import { Banner } from "czifui";

export const StyledBanner = styled(Banner)`
  /* media query - if less than 1490px wide, show on two lines */
  @media (max-width: 1490px) {
    height: 60px;
  }

  @media (max-width: 790px) {
    height: 90px;
  }
`;
