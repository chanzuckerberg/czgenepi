import CloseIcon from "@material-ui/icons/Close";
import { Button } from "czifui";
import React from "react";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import Dialog from "src/components/Dialog";
import {
  Content,
  StyledDiv,
  StyledFooter,
  StyledIconButton,
  Title,
} from "./style";
// import { StyledIconButton } from "src/common/components/library/data_subview/components/DownloadModal/style";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string | JSX.Element;
  content: string | JSX.Element;
  footer?: string;
  customConfirmButton?: JSX.Element;
  withCloseIcon?: boolean;
  disableBackdropClick?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  customConfirmButton,
  disableBackdropClick = true,
  title,
  content,
  footer,
  withCloseIcon = false,
}: ConfirmDialogProps): JSX.Element {
  const confirmButton = customConfirmButton ?? (
    <Button color="primary" variant="contained" isRounded>
      Continue
    </Button>
  );

  return (
    <Dialog
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle narrow>
        <StyledDiv>
          {withCloseIcon && (
            <StyledIconButton onClick={onClose}>
              <CloseIcon />
            </StyledIconButton>
          )}
          <Title>{title}</Title>
        </StyledDiv>
      </DialogTitle>
      <DialogContent narrow>
        <Content>{content}</Content>
      </DialogContent>
      <DialogActions narrow>
        <div onClick={onConfirm}>{confirmButton}</div>
        {!withCloseIcon && ( // if we have close icon we don't also need a cancel button
          <Button
            color="primary"
            variant="outlined"
            isRounded
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
      </DialogActions>
      {footer && <StyledFooter narrow>{footer}</StyledFooter>}
    </Dialog>
  );
}
