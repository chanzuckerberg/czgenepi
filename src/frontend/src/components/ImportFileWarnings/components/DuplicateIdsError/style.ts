import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const StyledTable = styled.table`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    // TODO (mlila): overlay colors not yet available from sds,
    // TODO          so hardcoding this for now.
    return `
      background-color: #F6EAEA;
      margin-top: ${spaces?.m}px;
      padding: ${spaces?.l}px;
      width: 100%;
    `;
  }}
`;
