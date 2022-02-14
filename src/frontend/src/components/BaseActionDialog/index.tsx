import { Dialog } from "@material-ui/core";
import React from "react";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { Content, StyledDiv, StyledFooter, Title } from "./style";

export interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string | JSX.Element;
  content: string | JSX.Element;
  footer?: string;
  customConfirmButton?: JSX.Element;
  disableBackdropClick?: boolean;
  isConfirmButtonClickable?: boolean;
  cancelButton?: JSX.Element;
  actionButton: JSX.Element;
  closeIcon?: JSX.Element | boolean;
}

export default function BaseDialog({
  open,
  onClose,
  disableBackdropClick = true,
  title,
  content,
  footer,
  cancelButton,
  actionButton,
  closeIcon = false,
}: BaseDialogProps): JSX.Element {
  return (
    <Dialog
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle narrow>
        <StyledDiv>
          {closeIcon}
          <Title>{title}</Title>
        </StyledDiv>
      </DialogTitle>
      <DialogContent narrow>
        <Content>{content}</Content>
      </DialogContent>
      <DialogActions narrow>
        {actionButton}
        {cancelButton}
      </DialogActions>
      {footer && <StyledFooter narrow>{footer}</StyledFooter>}
    </Dialog>
  );
}
