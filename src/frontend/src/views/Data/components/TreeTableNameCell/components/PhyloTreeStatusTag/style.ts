import styled from "@emotion/styled";
import { Chip, getSpacings } from "czifui";

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin: 0 ${spacings?.xs}px;
    `;
  }}
`;
