import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces } from "czifui";

export const StyledCell = styled.span`
  display: flex;
  align-items: center;

  svg {
    /* this margin is specific to the person svg (should be fixed in sds)
      we don't want it to change with sds spacing values */
    margin-bottom: -8px;
    transform: scale(1.33);
  }

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      svg {
        margin-right: ${spaces?.m}px;
      }

      path {
        fill: ${colors?.gray[300]};
      }
    `;
  }}
`;
