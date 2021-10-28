import styled from "@emotion/styled";
import { Chip, getSpaces } from "czifui";

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.xs}px;
    `;
  }}
`;
