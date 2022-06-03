import styled from "@emotion/styled";
import { getColors } from "czifui";

export const StyledCell = styled.span`
  display: flex;
  align-items: center;

  svg {
    /* this margin is specific to the person svg (should be fixed in sds)
      we don't want it to change with sds spacing values */
    margin-bottom: -8px;
    transform: scale(1.33);
  }

  ${(props) => {
    const colors = getColors(props);

    return `
      path {
        fill: ${colors?.gray[300]};
      }
    `;
  }}
`;
