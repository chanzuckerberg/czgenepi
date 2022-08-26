import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const StyledCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 150px;

  /* the name row should fill up any extra space */
  &:first-of-type {
    flex: 1 1 auto;
    width: unset;
    text-align: unset;
    justify-content: unset;
  }

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;
