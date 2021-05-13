import { DialogActionsProps } from "@material-ui/core";
import React from "react";
import { ExtraProps, StyledDialogActions } from "./style";

type Props = ExtraProps & DialogActionsProps;

const DialogActions = (props: Props): JSX.Element => {
  return <StyledDialogActions {...props} />;
};

export default DialogActions;
