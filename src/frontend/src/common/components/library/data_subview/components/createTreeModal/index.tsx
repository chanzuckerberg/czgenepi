import { Dialog } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState } from "react";
import { useMutation } from "react-query";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { createTree } from "src/common/queries/trees";
import {
  Content,
  Header,
  StyledButton,
  StyledIconButton,
  Title,
} from "../DownloadModal/style";

interface Props {
  sampleIds: string[];
  failedSamples: any[];
  open: boolean;
  onClose: () => void;
  setCreateTreeFailed: (hasFailed: boolean) => void;
}

export const CreateTreeModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
  setCreateTreeFailed,
}: Props): JSX.Element => {
  const [treeName, setTreeName] = useState<string>("");
  const [treeType, setTreeType] = useState<string>("");
  const mutation = useMutation(createTree, {
    onError: () => {
      setCreateTreeFailed(true);
    },
    onSuccess: (data: any) => {
      setTreeName("");
      setTreeType("");
      onClose();
    },
  });

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <StyledIconButton onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
        <Header>Create New Phylogenetic Tree</Header>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
        </Title>
      </DialogTitle>
      <DialogContent>
        There are {failedSamples.length} failed samples selected
        <Content data-test-id="modal-content">
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            disabled={false}
            onClick={() => {
              mutation.mutate({ sampleIds, treeName, treeType });
            }}
          >
            Create Tree
          </StyledButton>
        </Content>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};
