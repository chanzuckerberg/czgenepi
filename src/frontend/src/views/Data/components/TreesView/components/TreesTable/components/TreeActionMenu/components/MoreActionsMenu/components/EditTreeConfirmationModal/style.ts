import styled from "@emotion/styled";
import { ButtonIcon, CommonThemeProps, fontHeaderXl, getSpaces } from "czifui";

export const StyledTitle = styled.div`
  ${fontHeaderXl}
`;

export const StyledDiv = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledIconButton = styled(ButtonIcon)`
  display: flex;
  align-self: flex-end;
  padding: 0;
`;
