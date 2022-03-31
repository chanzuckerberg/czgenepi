import styled from "@emotion/styled";
import { Button, fontHeaderXxxs, getColors, getSpaces } from "czifui";

export const StyledButton = styled(Button)`
  ${fontHeaderXxxs}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.primary[400]};
      padding: ${spaces?.xs}px ${spaces?.xxs}px;

      &:hover, &:focus {
        background-color: ${colors?.primary[200]};
        color: ${colors?.primary[400]};
      }
    `;
  }}
`;
