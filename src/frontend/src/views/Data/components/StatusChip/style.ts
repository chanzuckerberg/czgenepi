import styled from "@emotion/styled";
import { Chip, CommonThemeProps, getSpaces } from "czifui";

export const StyledChip = styled(Chip)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.xs}px;
    `;
  }}
`;
