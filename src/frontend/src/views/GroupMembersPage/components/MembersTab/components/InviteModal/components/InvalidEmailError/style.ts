import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    // TODO (mlila): overlay colors not yet available from sds,
    // TODO          so hardcoding this for now.
    return `
      padding: ${spaces?.l}px;

      :nth-of-type(odd) {
        background-color: #F6EAEA;
        width: 100%;
      }
    `;
  }}
`;
