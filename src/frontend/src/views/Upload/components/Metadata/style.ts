import styled from "@emotion/styled";
import { Callout, CommonThemeProps, getColors, getSpaces } from "czifui";

export function marginBottom(props: CommonThemeProps): string {
  const spaces = getSpaces(props);

  return `
    margin-bottom: ${spaces?.xl}px;
  `;
}

export const StyledCallout = styled(Callout)`
  width: 100%;
  ${marginBottom}

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.info[100]};
    `;
  }}
`;
