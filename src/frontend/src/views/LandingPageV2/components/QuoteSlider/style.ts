import styled from "@emotion/styled";
import { getColors } from "czifui";

export const QuoteSliderContainer = styled.div`
  padding-bottom: 100px;
  text-align: center;

  & .slick-dots {
    bottom: -22%;

    & li {
      margin: 0 -2px;

      & button:before {
        font-size: 10px;
        color: black;
        opacity: 0.4;
      }

      &.slick-active button:before {
        color: white;
        opacity: 1;
      }
    }
  }

  ${(props) => {
    const colors = getColors(props);

    return `
      background: ${colors?.primary[400]};
    `;
  }}
`;
