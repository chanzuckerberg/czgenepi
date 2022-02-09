import { Button } from "czifui";
import React, { useEffect, useState } from "react";
import { TreeNameInput } from "src/common/components/library/data_subview/components/CreateNSTreeModal/components/TreeNameInput";
import { useEditTree } from "src/common/queries/trees";
import { EditDialog } from "src/components/EditDialog";
import Notification from "src/components/Notification";

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
    if (newTreeName === "") {
      if (tree) {
        setNewTreeName(tree.name);
      }
    }
  }, [newTreeName]);

  const editTreeMutation = useEditTree({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
      setNewTreeName("");
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
    },
  });

  const handleClose = function () {
    onClose();
    setNewTreeName("");
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

  const title = "Edit Tree Name";
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
    >
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
      <EditDialog
        open={open}
        onClose={handleClose}
        onEdit={onEdit}
        title={title}
        content={content}
        customConfirmButton={confirmButton}
      />
    </>
  );
};
