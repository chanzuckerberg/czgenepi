import { Dialog } from "@material-ui/core";
import React, { useState } from "react";
import { useEditTree } from "src/common/queries/trees";
import Notification from "src/components/Notification";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { Button } from "czifui";
import { Content, StyledFooter, Title } from "src/components/ConfirmDialog/style";
import { TreeNameInput } from "src/common/components/library/data_subview/components/CreateNSTreeModal/components/TreeNameInput";

interface Props {
  onClose(): void;
  open: boolean;
  tree?: Tree;
}

export const EditTreeConfirmationModal = ({
  onClose,
  open,
  tree,
}: Props): JSX.Element | null => {
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [shouldShowSuccessNotification, setShouldShowSuccessNotification] =
    useState<boolean>(false);
  const [newTreeName, setNewTreeName] = useState<string>("");

  const editTreeMutation = useEditTree({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
    },
  });

  if (!tree) return null;

  const { workflowId, name } = tree;

  const onEdit = () => {
    editTreeMutation.mutate({
      treeIdToEdit: workflowId,
      newTreeName: newTreeName,

    });
    onClose();
  };

  const title = "Edit Tree Name";
  const content = (
    <>
    <TreeNameInput setTreeName={setNewTreeName} treeName={newTreeName} />
    </>
  );

  const confirmButton = (
    <Button color="primary" variant="contained" isRounded>
      Update
    </Button>
  );

  return (
    <>
      {shouldShowSuccessNotification && (
        <Notification
          autoDismiss
          buttonOnClick={() => setShouldShowSuccessNotification(false)}
          buttonText="DISMISS"
          dismissDirection="right"
          dismissed={!shouldShowSuccessNotification}
          intent="info"
        >
          Your tree has been deleted.
        </Notification>
      )}
      {shouldShowErrorNotification && (
        <Notification
          autoDismiss
          buttonOnClick={() => setShouldShowErrorNotification(false)}
          buttonText="DISMISS"
          dismissDirection="right"
          dismissed={!shouldShowErrorNotification}
          intent="error"
        >
          We were unable to delete your tree. Please try again later.
        </Notification>
      )}
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
          <div onClick={onEdit}>{confirmButton}</div>
          <Button color="primary" variant="outlined" isRounded onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
