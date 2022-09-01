import styled from "@emotion/styled";
import { CommonThemeProps, getColors, Icon } from "czifui";

export const HiddenInput = styled.input`
  display: none;
`;

export const StyledIcon = styled(Icon)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.gray[200]};
    `;
  }}
`;
