import { useDeletePhyloRun } from "src/common/queries/phyloRuns";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { DeleteDialog } from "src/components/DeleteDialog";

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
  const dispatch = useDispatch();

  const deletePhyloRunMutation = useDeletePhyloRun({
    componentOnSuccess: () => {
      dispatch(addNotification({
        autoDismiss: true,
        reduxId: Date.now(),
        intent: "info",
        shouldShowCloseButton: true,
        text: "Your tree has been deleted.",
      }));
    },
    componentOnError: () => {
      dispatch(addNotification({
        autoDismiss: true,
        reduxId: Date.now(),
        intent: "error",
        shouldShowCloseButton: true,
        text: "We were unable to delete your tree. Please try again later.",
      }));
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
    <DeleteDialog
      open={open}
      onDelete={onDelete}
      onClose={onClose}
      title={title}
      content={content}
    />
  );
};

export { DeleteTreeConfirmationModal };
