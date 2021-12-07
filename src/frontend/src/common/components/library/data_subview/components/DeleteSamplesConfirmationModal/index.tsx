import React from "react";
import { noop } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { useDeleteSamples } from "src/common/queries/samples";
import { pluralize } from "src/common/utils/strUtils";
import { DeleteDialog } from "src/components/DeleteDialog";

interface Props {
  checkedSamples: Sample[];
  onClose(): void;
  open: boolean;
}

// TODO need to cleared checkedsamples state in parent or else the checked sample counter is wrong
const DeleteSamplesConfirmationModal = ({
  checkedSamples,
  onClose,
  open,
}: Props): JSX.Element | null => {
  const { data } = useUserInfo();
  const { group: userGroup } = data ?? {};

  const samplesToDelete = checkedSamples
    .filter((sample) => sample.submittingGroup?.name === userGroup?.name)
    .map((sample) => sample.id);

  // TODO (mlila): update these callbacks to display notifications
  // TODO          as part of #173849
  const deleteSampleMutation = useDeleteSamples({
    onSuccess: noop,
    onError: noop,
  });

  const onDelete = () => {
    deleteSampleMutation.mutate({
      samplesToDelete,
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
