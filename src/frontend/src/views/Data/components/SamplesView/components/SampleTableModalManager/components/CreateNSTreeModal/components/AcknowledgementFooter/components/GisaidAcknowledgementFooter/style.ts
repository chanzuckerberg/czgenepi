import styled from "@emotion/styled";
import { CommonThemeProps, fontBodyXxxs, getColors, getSpaces } from "czifui";

const gray500 = (props: CommonThemeProps) => {
  const colors = getColors(props);

  return `
    color: ${colors?.gray[500]};
  `;
};

export const Acknowledgements = styled.p`
  margin: 0;
  ${fontBodyXxxs}
  ${gray500}
`;

interface SeparatorProps extends CommonThemeProps {
  marginSize: "l" | "xl";
  marginBottomSize?: "l" | "xl";
}

const doNotForwardProps = ["marginSize"];

export const Separator = styled("div", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  height: 0;

  ${(props: SeparatorProps) => {
    const { marginSize, marginBottomSize } = props;
    const colors = getColors(props);
    const spaces = getSpaces(props);

    const margin = marginBottomSize
      ? `${spaces?.[marginSize]}px 0 ${spaces?.[marginBottomSize]}px 0`
      : `${spaces?.[marginSize]}px 0`;

    return `
      border-top: 1px solid ${colors?.gray[200]};
      margin: ${margin};
    `;
  }}
`;
