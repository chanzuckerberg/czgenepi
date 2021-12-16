import React from "react";
import { noop } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { useDeleteTrees } from "src/common/queries/trees";
import { DeleteDialog } from "src/components/DeleteDialog";

interface Props {
  onClose(): void;
  open: boolean;
  tree: TableItem;
}

const DeleteTreeConfirmationModal = ({
  onClose,
  open,
  tree,
}: Props): JSX.Element | null => {
  const { data } = useUserInfo();
  const { group: userGroup } = data ?? {};

  const { id, name } = tree;

  const deleteTreeMutation = useDeleteTrees({
    onSuccess: noop,
    onError: noop,
  });

  const onDelete = () => {
    deleteTreeMutation.mutate({
      treeIdToDelete: id,
    });
    onClose();
  };

  if (!open) return null;

  const title = `Are you sure you want to delete ${name}?`;

  const content = (
    <div>
      Deleted trees will be removed from Aspen. You will not be able to undo
      this action.
    </div>
  );

  return (
    <DeleteDialog
      open
      onClose={onClose}
      onDelete={onDelete}
      title={title}
      content={content}
    />
  );
};

export { DeleteTreeConfirmationModal };
