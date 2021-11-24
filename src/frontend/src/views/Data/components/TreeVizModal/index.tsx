import React from "react";
import { RedirectConfirmationModal } from "src/common/components/library/data_subview/components/RedirectConfirmationModal";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import nextstrainLogo from "src/common/images/nextstrain.png";
import { ConfirmButton } from "src/common/utils/TreeModal/ConfirmButton";

interface Props {
  open: boolean;
  onClose: () => void;
  treeId: number;
}

const TreeVizModal = ({ open, onClose, treeId }: Props): JSX.Element => {
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your tree JSON to
      Nextstrain’s visualization service. Nextstrain is a separate service from
      CZ GEN EPI.{" "}
      <NewTabLink href="https://nextstrain.org/">Learn More</NewTabLink>
    </>
  );

  const confirmButton = <ConfirmButton treeId={treeId} />;

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

export default TreeVizModal;
