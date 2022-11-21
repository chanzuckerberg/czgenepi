import {
  AnalyticsTreeViewNextstrain,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { RedirectConfirmationModal } from "src/common/components/library/data_subview/components/RedirectConfirmationModal";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import nextstrainLogo from "src/common/images/nextstrain.png";
import { ConfirmButton } from "src/components/ConfirmButton";

interface Props {
  open: boolean;
  onClose: () => void;
  treeId: number;
}

const NextstrainConfirmationModal = ({
  open,
  onClose,
  treeId,
}: Props): JSX.Element => {
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your tree JSON to
      Nextstrain’s visualization service. Nextstrain is a separate service from
      CZ GEN EPI.{" "}
      <NewTabLink href="https://nextstrain.org/">Learn More</NewTabLink>
    </>
  );

  const confirmButton = (
    <ConfirmButton
      treeId={treeId}
      outgoingDestination="nextstrain"
      onClick={() =>
        analyticsTrackEvent<AnalyticsTreeViewNextstrain>(
          EVENT_TYPES.TREE_VIEW_NEXTSTRAIN,
          {
            tree_id: treeId,
          }
        )
      }
    />
  );

  return (
    <RedirectConfirmationModal
      content={content}
      customConfirmButton={confirmButton}
      img={nextstrainLogo as unknown as string}
      isOpen={open}
      onClose={onClose}
      onConfirm={onClose}
      logoWidth={180}
    />
  );
};

export default NextstrainConfirmationModal;
