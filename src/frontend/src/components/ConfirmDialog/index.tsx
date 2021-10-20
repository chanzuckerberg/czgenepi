import { Dialog } from "@material-ui/core";
import { Button } from "czifui";
import React from "react";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { Content, StyledFooter, Title } from "./style";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string | JSX.Element;
  content: string | JSX.Element;
  footer?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  content,
  footer,
}: Props): JSX.Element {
  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle narrow>
        <Title>{title}</Title>
      </DialogTitle>
      <DialogContent narrow>
        <Content>{content}</Content>
      </DialogContent>
      <DialogActions narrow>
        <Button
          color="primary"
          variant="contained"
          isRounded
          onClick={onConfirm}
        >
          Continue
        </Button>
        <Button color="primary" variant="outlined" isRounded onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
      <StyledFooter narrow>{footer}</StyledFooter>
    </Dialog>
  );
}
