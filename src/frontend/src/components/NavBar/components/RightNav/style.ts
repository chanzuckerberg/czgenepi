import styled from "@emotion/styled";
import { Button, getSpacings } from "czifui";

export const UploadButton = styled(Button)`
  color: white;
  border: 1px solid white;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-right: ${spacings?.xl}px;
    `;
  }}
`;
