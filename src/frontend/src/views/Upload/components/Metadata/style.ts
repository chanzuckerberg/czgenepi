import styled from "@emotion/styled";
import { Button, getSpacings } from "czifui";

export const ContinueButton = styled(Button)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-right: ${spacings?.xs}px;
    `;
  }}
`;
