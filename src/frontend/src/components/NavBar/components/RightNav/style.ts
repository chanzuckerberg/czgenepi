import styled from "@emotion/styled";
import { Button, getColors, getSpaces } from "czifui";

const whiteBorder = "border: 1px solid white;";
export const UploadButton = styled(Button)`
  color: white;
  ${whiteBorder}

  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      margin-right: ${spaces?.xl}px;

      &:hover {
        ${whiteBorder}
        color: black;
        background-color: white;
      }

      &:active {
        background-color: ${colors?.gray[200]};
      }
    `;
  }}
`;

export const ResourcesLink = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.xxl}px;
    `;
  }}
`;
