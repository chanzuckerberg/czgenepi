import React from "react";
import { noop } from "src/common/constants/empty";
import { useDeleteSamples } from "src/common/queries/samples";
import { pluralize } from "src/common/utils/strUtils";
import { DeleteDialog } from "src/components/DeleteDialog";

interface Props {
  checkedSamples: string[];
  onClose(): void;
  open: boolean;
}

const DeleteSamplesConfirmationModal = ({
  checkedSamples,
  onClose,
  open,
}: Props): JSX.Element | null => {
  // TODO (mlila): update these callbacks to display notifications
  // TODO          as part of #173849
  const deleteSampleMutation = useDeleteSamples({
    onSuccess: noop,
    onError: noop,
  });

  const onDelete = () => {
    deleteSampleMutation.mutate({
      // TODO (mlila): this should be an array of db unique ids
      // TODO          this requires a refactor
      samplesToDelete: checkedSamples,
    });
    onClose();
  };

  if (!open) return null;

  const numSamples = checkedSamples.length;
  const title = `Are you sure you want to delete ${numSamples} ${pluralize(
    "sample",
    numSamples
  )}?`;

  const content =
    "Deleted samples will be removed from Aspen. If these samples were included in previously generated trees, they will be shown with their public IDs only. You will not be able to undo this action.";

  return (
    <DeleteDialog
      open={open}
      onClose={onClose}
      onDelete={onDelete}
      title={title}
      content={content}
    />
  );
};

export { DeleteSamplesConfirmationModal };
