import styled from "@emotion/styled";
import { Chip, getSpaces } from "czifui";

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spacings = getSpaces(props);

    return `
      margin: 0 ${spacings?.xs}px;
    `;
  }}
`;
