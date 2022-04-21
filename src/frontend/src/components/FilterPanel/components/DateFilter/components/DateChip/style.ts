import styled from "@emotion/styled";
import { Chip, getSpaces } from "czifui";

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xxs}px ${spaces?.xxs}px 0 0;
    `;
  }}
`;
