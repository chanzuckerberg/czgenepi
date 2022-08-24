import styled from "@emotion/styled";
import { CommonThemeProps, getFontWeights, getSpaces, Tag } from "czifui";

export const StyledTag = styled(Tag)`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.xs}px;

      .MuiChip-label {
        font-weight: ${fontWeights?.semibold};
        text-transform: uppercase;
        letter-spacing: 1px;
      }
    `;
  }}
`;
