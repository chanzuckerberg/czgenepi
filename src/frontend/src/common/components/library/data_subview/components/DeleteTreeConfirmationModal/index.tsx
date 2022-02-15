import React, { useState } from "react";
import { useDeleteTree } from "src/common/queries/trees";
import { DeleteDialog } from "src/components/DeleteDialog";
import { StyledButton } from "src/components/DeleteDialog/style";
import Notification from "src/components/Notification";

interface Props {
  onClose(): void;
  open: boolean;
  tree?: Tree;
}

const DeleteTreeConfirmationModal = ({
  onClose,
  open,
  tree,
}: Props): JSX.Element | null => {
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [shouldShowSuccessNotification, setShouldShowSuccessNotification] =
    useState<boolean>(false);

  const deleteTreeMutation = useDeleteTree({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
    },
  });

  if (!tree) return null;

  const { workflowId, name } = tree;

  const onDelete = () => {
    deleteTreeMutation.mutate({
      treeIdToDelete: workflowId,
    });
    onClose();
  };

  const title = `Are you sure you want to delete “${name}”?`;
  const content = (
    <span>
      Deleted trees will be removed from CZ GEN EPI. You will not be able to
      undo this action.
    </span>
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
      <DeleteDialog
        open={open}
        onDelete={onDelete}
        onClose={onClose}
        title={title}
        content={content}
      />
    </>
  );
};

export { DeleteTreeConfirmationModal };
