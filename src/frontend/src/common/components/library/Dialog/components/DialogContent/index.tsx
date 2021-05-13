import { DialogContentProps } from "@material-ui/core";
import React from "react";
import { ExtraProps, StyledDialogContent } from "./style";

type Props = ExtraProps & DialogContentProps;

const DialogContent = (props: Props): JSX.Element => {
  return <StyledDialogContent {...props} />;
};

export default DialogContent;
