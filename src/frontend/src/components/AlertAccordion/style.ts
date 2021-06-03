import styled from "@emotion/styled";
import { getColors, getSpacings, Props } from "czifui";

export type Variant = "success" | "info" | "error" | "warning";

interface WrapperProps extends Props {
  variant: Variant;
}

export const Wrapper = styled.div`
  ${(props: WrapperProps) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    const { variant } = props;

    const variantToBackgroundColor = {
      error: colors?.error[100],
      info: colors?.info[100],
      success: colors?.success[100],
      warning: colors?.warning[100],
    };

    return `
      background-color: ${variantToBackgroundColor[variant]};
      padding: ${spacings?.m}px;
    `;
  }}
`;
