import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";
import { accessibleFocusBorder } from "src/common/styles/accessibility";

export const StyledActionWrapper = styled.li`
  list-style: none;
  ${accessibleFocusBorder}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.xs}px;

      &:last-child {
        margin-right: 0;
      }

      padding: ${spaces?.xxxs}px;
    `;
  }}
`;

export const StyledTreeActionMenu = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 150px;
  padding: 0;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;
