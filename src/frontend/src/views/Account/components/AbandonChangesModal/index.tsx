import { Button, Dialog, DialogContent, Icon } from "czifui";
import React from "react";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { Content, Header, StyledButton, StyledDialogTitle } from "./style";

interface AbandonChangesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AbandonChangesModal({
  open,
  onClose,
}: AbandonChangesModalProps): JSX.Element {
  // TODO: if this doesn't get more complicated, remove and just use onClose
  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} sdsSize="xs">
      <StyledDialogTitle>
        <StyledCloseIconButton
          aria-label="Keep editing"
          onClick={handleCloseModal}
        >
          <StyledCloseIconWrapper>
            <Icon sdsIcon="xMark" sdsSize="l" sdsType="static" />
          </StyledCloseIconWrapper>
        </StyledCloseIconButton>
        <Header>Leave without saving?</Header>
      </StyledDialogTitle>
      <DialogContent>
        <Content>
          If you leave, your changes will be canceled and your work will not be
          saved.
        </Content>
        <StyledButton sdsType="primary" sdsStyle="rounded">
          Leave
        </StyledButton>
        <Button sdsType="secondary" sdsStyle="rounded">
          Keep Editing
        </Button>
      </DialogContent>
    </Dialog>
  );
}
