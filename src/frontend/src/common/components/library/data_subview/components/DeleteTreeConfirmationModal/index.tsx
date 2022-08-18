import { useState } from "react";
import { useDeletePhyloRun } from "src/common/queries/phyloRuns";
import { DeleteDialog } from "src/components/DeleteDialog";
import Notification from "src/components/Notification";

interface Props {
  onClose(): void;
  open: boolean;
  phyloRun?: PhyloRun;
}

const DeleteTreeConfirmationModal = ({
  onClose,
  open,
  phyloRun,
}: Props): JSX.Element | null => {
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [shouldShowSuccessNotification, setShouldShowSuccessNotification] =
    useState<boolean>(false);

  const deletePhyloRunMutation = useDeletePhyloRun({
    componentOnSuccess: () => {
      setShouldShowSuccessNotification(true);
    },
    componentOnError: () => {
      setShouldShowErrorNotification(true);
    },
  });

  if (!phyloRun) return null;

  const { id, name } = phyloRun;

  const onDelete = () => {
    if (!id) return;

    deletePhyloRunMutation.mutate({
      phyloRunIdToDelete: id,
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
