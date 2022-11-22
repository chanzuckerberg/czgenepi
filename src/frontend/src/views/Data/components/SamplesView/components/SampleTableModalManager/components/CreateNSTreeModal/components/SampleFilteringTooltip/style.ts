import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces, Tooltip } from "czifui";
import { iconFillGrayHoverPrimary } from "src/common/styles/iconStyle";

export const StyledTooltip = styled(Tooltip)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xxs}px;
    `;
  }}
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}
`;
