import { isEmpty } from "lodash";
import { useUserInfo } from "src/common/queries/auth";
import { useDeleteSamples } from "src/common/queries/samples";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
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
  const dispatch = useDispatch();

  const { data: userInfo } = useUserInfo();
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);

  const samplesToDelete = checkedSamples
    .filter((sample) => sample.submittingGroup?.name === currentGroup?.name)
    .map((sample) => sample.id);

  const deleteSampleMutation = useDeleteSamples({
    componentOnError: () => {
      dispatch(
        addNotification({
          autoDismiss: true,
          intent: "error",
          shouldShowCloseButton: true,
          text: "We were unable to delete the selected samples. Please try again later.",
        })
      );
    },
    componentOnSuccess: () => {
      const numDeletedSamples = samplesToDelete.length;

      dispatch(
        addNotification({
          autoDismiss: true,
          intent: "info",
          shouldShowCloseButton: true,
          text: `${numDeletedSamples} ${pluralize(
            "sample",
            numDeletedSamples
          )} ${pluralize("has", numDeletedSamples)} been deleted.`,
        })
      );
    },
  });

  if (!open) return null;

  const onDelete = () => {
    deleteSampleMutation.mutate({
      samplesToDelete,
    });
    onClose();
  };

  const numSamples = checkedSamples.length;
  const title = `Are you sure you want to delete ${numSamples} ${pluralize(
    "sample",
    numSamples
  )}?`;

  const numSamplesCantDelete = checkedSamples.length - samplesToDelete.length;
  const content = (
    <div>
      <span>
        Deleted samples will be removed from CZ GEN EPI. If these samples were
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
      isDeleteDisabled={isEmpty(samplesToDelete)}
      title={title}
      content={content}
    />
  );
};

export { DeleteSamplesConfirmationModal };
