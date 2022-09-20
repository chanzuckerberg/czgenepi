import {
  AnalyticsTreeViewGalago,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { RedirectConfirmationModal } from "src/common/components/library/data_subview/components/RedirectConfirmationModal";
import galagoLogo from "src/common/images/galago-logo-beta.png";
// TODO: (ehoops) - This button will change when we create the galago URL in sc-214181
// currently this is just using the nextstrain url as a placeholder
import { ConfirmButton } from "src/common/utils/TreeModal/ConfirmButton";

interface Props {
  open: boolean;
  onClose: () => void;
  treeId: number;
}

export const GalagoConfirmationModal = ({
  open,
  onClose,
  treeId,
}: Props): JSX.Element => {
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your tree JSON to
      Galago (Beta), a separate, but related service from CZ GEN EPI. Galago is
      a serverless web application which runs entirely in the browser. Galago
      does not store or share your data; however, you may choose to share the
      URL with others.
    </>
  );

  const confirmButton = (
    <ConfirmButton
      treeId={treeId}
      outgoingDestination="galago"
      onClick={() =>
        analyticsTrackEvent<AnalyticsTreeViewGalago>(
          EVENT_TYPES.TREE_VIEW_GALAGO,
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
      img={galagoLogo as unknown as string}
      isOpen={open}
      onClose={onClose}
      onConfirm={onClose}
      logoWidth={180}
    />
  );
};
