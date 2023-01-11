import styled from "@emotion/styled";
import { CommonThemeProps, fontBodyXs, fontHeaderXs, getSpaces } from "czifui";

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 250px;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xxxs}px 0;
    `;
  }}
`;

export const Label = styled.span`
  ${fontHeaderXs}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const Text = styled.span`
  ${fontBodyXs}
`;
