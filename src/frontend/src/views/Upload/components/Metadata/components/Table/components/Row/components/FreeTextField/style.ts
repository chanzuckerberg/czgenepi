import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpacings, Props as CommonProps } from "czifui";

interface Props extends CommonProps {
  isShown: boolean;
}

// (thuang): Please keep this in sync with the props used in `Props`
const doNotForwardProps = ["isShown"];

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: Props) => {
    const spacings = getSpacings(props);
    const { isShown } = props;

    return `
      width: ${(spacings?.l || 0) + 200}px;
      padding-right: ${spacings?.l}px;
      visibility: ${isShown ? "default" : "hidden"};
      margin: 0;
    `;
  }}
`;
