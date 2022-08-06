import {
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
} from "@mui/material";
import React from "react";

interface Props extends MuiDialogProps {
  disableBackdropClick?: boolean;
  onClose(): void;
}

// This component wraps Dialog and handles `Failed prop type: The prop disableBackdropClick of ForwardRef(Dialog) is deprecated`

export default function Dialog({
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

  return <MuiDialog onClose={handleClose} {...props} />;
}
