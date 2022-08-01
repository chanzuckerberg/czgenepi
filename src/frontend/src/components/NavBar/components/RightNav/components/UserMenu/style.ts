import styled from "@emotion/styled";
import { Button, CommonThemeProps, getPalette } from "czifui";
import { iconFillWhite } from "src/common/styles/iconStyle";

export const StyledNavButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const palette = getPalette(props);
    return `
      color: ${palette?.common?.white};
    `;
  }}
`;

export const StyledNavIconWrapper = styled.div`
  ${iconFillWhite}
`;
