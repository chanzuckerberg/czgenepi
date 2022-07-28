import styled from "@emotion/styled";
import { CommonThemeProps, getColors } from "czifui";
import {
  iconFillBlack,
  iconFillError,
  rightMarginM,
} from "src/common/styles/iconStyle";

interface ExtraProps extends CommonThemeProps {
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

export const StyledTrashIconWrapper = styled.div`
  ${rightMarginM}
  ${iconFillError}
`;

export const StyledEditIconWrapper = styled.div`
  ${iconFillBlack}
  ${rightMarginM}
`;
