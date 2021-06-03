import styled from "@emotion/styled";
import { getSpacings } from "czifui";
import Instructions from "src/components/Instructions";

export const StyledInstructions = styled(Instructions)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.xl}px;
    `;
  }}
`;
