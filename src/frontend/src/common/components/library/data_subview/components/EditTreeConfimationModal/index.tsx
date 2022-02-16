import React, { useState } from "react";
import { useEditTree } from "src/common/queries/trees";
import { EditTreeDialog } from "src/components/DeleteDialog";
import Notification from "src/components/Notification";

interface Props {
  onClose(): void;
  open: boolean;
  tree?: Tree;
}

const EditTreeModal = ({
  onClose,
  open,
  tree,
}: Props): JSX.Element | null => {
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [shouldShowSuccessNotification, setShouldShowSuccessNotification] =
    useState<boolean>(false);

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

  const onDelete = () => {
    editTreeMutation.mutate({
      treeId: workflowId,

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
      <EditTreeDialog
        open={open}
        onClose={onClose}
        onDelete={onDelete}
        title={title}
        content={content}
      />
    </>
  );
};

export { DeleteTreeConfirmationModal };
