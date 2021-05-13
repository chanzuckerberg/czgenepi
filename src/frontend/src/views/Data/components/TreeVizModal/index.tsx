import { Dialog } from "@material-ui/core";
import { Button } from "czifui";
import React from "react";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { ModalInfo } from "src/common/types/ui";
import { Content, Header } from "./style";

interface Props {
  info: ModalInfo;
  open: boolean;
  onClose: () => void;
}

const TreeVizModal = ({ info, open, onClose }: Props): JSX.Element => {
  const { body, buttons, header } = info;
  const { content } = buttons[1];

  const ConfirmButton = buttons[0].Button;

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle narrow>
        <Header>{header}</Header>
      </DialogTitle>
      <DialogContent narrow>
        <Content>{body}</Content>
      </DialogContent>
      <DialogActions narrow>
        {ConfirmButton && <ConfirmButton onClick={onClose} />}
        <Button color="primary" variant="outlined" isRounded onClick={onClose}>
          {content}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TreeVizModal;
