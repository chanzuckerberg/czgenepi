import { Dialog, DialogProps as MuiDialogProps } from "@material-ui/core";
import React from "react";

interface Props extends MuiDialogProps {
  disableBackdropClick?: boolean;
  onClose(): void;
}

// This component wraps Dialog and handles the backdropClick prop which is now depreciated
export default function DialogNoDepreciation({
  disableBackdropClick = false,
  onClose,
  ...props
}: Props): JSX.Element {
  const handleClose = (_event: any, reason: string) => {
    if (disableBackdropClick && reason === "backdropClick") {
      return false;
    }
    onClose();
  };

  return <Dialog onClose={handleClose} {...props} />;
}
