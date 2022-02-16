// includes shared styles for icons
import styled from "@emotion/styled";
import { Button, getColors, getSpaces } from "czifui";

export const IconButtonBubble = styled(Button)`
  border-radius: 50%;
  flex: 0 0 0;
  min-width: unset;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
    fill: ${colors?.gray[300]};
    margin: ${spaces?.xxxs}px;
    padding: ${spaces?.xs}px;
  `;
  }}
`;
