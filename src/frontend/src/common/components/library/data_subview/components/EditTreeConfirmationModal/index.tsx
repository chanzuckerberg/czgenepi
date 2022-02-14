import CloseIcon from "@material-ui/icons/Close";
import { Button } from "czifui";
import React, { useEffect, useState } from "react";
import { useEditTree } from "src/common/queries/trees";
import BaseDialog from "src/components/BaseActionDialog";
import { StyledIconButton } from "src/components/BaseActionDialog/style";
import { StyledSpan } from "src/components/DeleteDialog/style";
import Notification from "src/components/Notification";
import { TreeNameInput } from "src/components/TreeNameInput";

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

  const treeNameLength = newTreeName ? newTreeName.length : 0;
  const hasValidName = treeNameLength > 0 && treeNameLength <= 128;

  useEffect(() => {
    // this makes sure that the newTreeName defaults to the current tree name,
    //  and that the component remounts when we edit a new tree
    if (tree) {
      setNewTreeName(tree.name);
    }
  }, [tree, setNewTreeName]);

  const editTreeMutation = useEditTree({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
      setNewTreeName("");
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
      setNewTreeName("");
    },
  });

  const handleClose = function () {
    onClose();
  };

  if (!tree) return null;

  const { workflowId } = tree;

  const onEdit = () => {
    editTreeMutation.mutate({
      treeIdToEdit: workflowId,
      newTreeName: newTreeName,
    });
    onClose();
  };

  const title = <StyledSpan>Edit Tree Name</StyledSpan>;

  const content = (
    <>
      <TreeNameInput
        setTreeName={setNewTreeName}
        treeName={newTreeName}
        withCollapsibleInstructions={false}
        textInputLabel={"Tree Name: "}
        isTextInputMultiLine={true}
      />
    </>
  );

  const confirmButton = (
    <Button
      color="primary"
      variant="contained"
      disabled={!hasValidName}
      isRounded
      onClick={onEdit}
    >
      Update
    </Button>
  );

  const closeIcon = (
    <StyledIconButton onClick={onClose}>
      <CloseIcon />
    </StyledIconButton>
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
          Tree name was successfully updated.
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
          Something went wrong and we were unable to update your tree name.
          Please try again later.
        </Notification>
      )}
      <BaseDialog
        open={open}
        onClose={handleClose}
        title={title}
        content={content}
        actionButton={confirmButton}
        closeIcon={closeIcon}
      />
    </>
  );
};
