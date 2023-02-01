import styled from "@emotion/styled";
import { CommonThemeProps, getColors } from "czifui";

// needed to keep search bar sticky
export const StyledWrapper = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;

  & > div {
    overflow: auto;
  }

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      tr:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;
