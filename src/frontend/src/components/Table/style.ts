import styled from "@emotion/styled";
import { CommonThemeProps, getColors } from "czifui";

export const StyledWrapper = styled.div`
  /* needed to keep search bar sticky */
  flex: 1 1 auto;
  overflow-y: auto;

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      tbody tr:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;
