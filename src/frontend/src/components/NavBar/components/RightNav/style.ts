import styled from "@emotion/styled";
import { Button, getColors, getSpaces } from "czifui";

export const UploadButton = styled(Button)`
  color: white;
  border: 1px solid white;

  ${(props) => {
    const spacings = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-right: ${spacings?.xl}px;

      &:hover {
        color: black;
        background-color: white;
      }

      &:active {
        background-color: ${colors?.gray[200]};
      }
    `;
  }}
`;
