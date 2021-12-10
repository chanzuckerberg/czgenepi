import styled from "@emotion/styled";
import { DialogActions } from "@material-ui/core";
import { getSpaces, Props } from "czifui";
import { narrow } from "../common";

export interface ExtraProps extends Props {
  narrow?: boolean;
}

// (thuang): Please keep this in sync with the props used in `ExtraProps`
const doNotForwardProps = ["narrow"];

export const StyledDialogActions = styled(DialogActions, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  justify-content: flex-start;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: 0 ${spaces?.xxl}px ${spaces?.xxl}px ${spaces?.xxl}px;

      &.MuiDialogActions-spacing > :not(:first-of-type) {
        margin-left: ${spaces?.m}px;
      }
    `;
  }}

  ${narrow}
`;
