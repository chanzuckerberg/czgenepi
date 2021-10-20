import React from "react";
import { RedirectConfirmationModal } from "src/common/components/library/data_subview/components/RedirectConfirmationModal";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import nextstrainLogo from "src/common/images/nextstrain.png";

interface Props {
  open: boolean;
  onClose: () => void;
  treeId: number;
}

const TreeVizModal = ({ open, onClose, treeId }: Props): JSX.Element => {
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your genomic data to
      Nexstrain’s visualization service, and that you understand this may make
      the data accessible to others. Nextstrain is a separate service from
      Aspen. <NewTabLink href="https://nextstrain.org/">Learn More</NewTabLink>
    </>
  );

  return (
    <RedirectConfirmationModal
      content={content}
      img={nextstrainLogo as string}
      isOpen={open}
      onClose={onClose}
      onConfirm={onClose}
    />
  );
};

export default TreeVizModal;
