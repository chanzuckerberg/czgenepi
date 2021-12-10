import React from "react";
import { noop } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { useDeleteSamples } from "src/common/queries/samples";
import { B } from "src/common/styles/support/style";
import { pluralize } from "src/common/utils/strUtils";
import { DeleteDialog } from "src/components/DeleteDialog";
import { StyledCallout } from "./style";

interface Props {
  checkedSamples: Sample[];
  onClose(): void;
  open: boolean;
}

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

  const numSamplesCantDelete = checkedSamples.length - samplesToDelete.length;
  const content = (
    <div>
      <span>
        Deleted samples will be removed from Aspen. If these samples were
        included in previously generated trees, they will be shown with their
        public IDs only. You will not be able to undo this action.
      </span>
      {numSamplesCantDelete > 0 && (
        <StyledCallout intent="warning">
          <B>
            {numSamplesCantDelete} Selected{" "}
            {pluralize("Sample", numSamplesCantDelete)} can’t be deleted
          </B>{" "}
          because they are managed by another jurisdiction.
        </StyledCallout>
      )}
    </div>
  );

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
