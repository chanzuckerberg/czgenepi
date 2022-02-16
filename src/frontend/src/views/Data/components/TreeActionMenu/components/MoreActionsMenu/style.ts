import styled from "@emotion/styled";
import { getColors, Props } from "czifui";

interface ExtraProps extends Props {
  isWarning?: boolean;
}

const doNotForwardProps = ["isWarning"];

export const StyledText = styled("span", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const { isWarning } = props;
    const colors = getColors(props);

    return `
      color: ${isWarning ? colors?.error[600] : ""};
    `;
  }}
`;
