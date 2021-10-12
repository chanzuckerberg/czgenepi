import styled from "@emotion/styled";
import { DialogActions } from "@material-ui/core";
import { getSpacings, Props } from "czifui";
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
    const spacings = getSpacings(props);

    return `
      padding: 0 ${spacings?.xxl}px ${spacings?.xxl}px ${spacings?.xxl}px;

      &.MuiDialogActions-spacing > :not(:first-child) {
        margin-left: ${spacings?.m}px;
      }
    `;
  }}

  ${narrow}
`;
