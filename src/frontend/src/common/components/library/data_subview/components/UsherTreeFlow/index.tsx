import React, { useEffect, useState } from "react";
import { UsherConfirmationModal } from "./components/UsherConfirmationModal";
import { UsherPlacementModal } from "./components/UsherPlacementModal";
import { UsherPreparingModal } from "./components/UsherPreparingModal";

interface Props {
  checkedSamples: string[];
  failedSamples: string[];
  shouldStartUsherFlow: boolean;
}

const UsherTreeFlow = ({
  checkedSamples,
  failedSamples,
  shouldStartUsherFlow,
}: Props): JSX.Element => {
  const [isPlacementOpen, setIsPlacementOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isPreparingOpen, setIsPreparingOpen] = useState<boolean>(false);
  const [fastaUrl, setFastaUrl] = useState<string>("");

  useEffect(() => {
    if (shouldStartUsherFlow) handlePlacementOpen();
  }, [shouldStartUsherFlow]);

  const handlePlacementOpen = () => {
    setIsPlacementOpen(true);
  };

  const handlePlacementClose = () => {
    setFastaUrl("");
    setIsPlacementOpen(false);
  };

  const onLinkCreateSuccess = (url: string) => {
    setFastaUrl(url);
    setIsConfirmOpen(true);
  };

  const handleConfirmationClose = () => {
    handlePlacementClose();
    setIsConfirmOpen(false);
    setIsPreparingOpen(false);
  };

  const handleConfirmationConfirm = () => {
    setIsConfirmOpen(false);
    setIsPreparingOpen(true);
  };

  const handlePreparingClose = () => {
    handlePlacementClose();
    setIsPreparingOpen(false);
  };

  return (
    <>
      <UsherPlacementModal
        sampleIds={checkedSamples}
        failedSamples={failedSamples}
        open={isPlacementOpen}
        onClose={handlePlacementClose}
        onLinkCreateSuccess={onLinkCreateSuccess}
      />
      <UsherConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
      />
      <UsherPreparingModal
        isOpen={isPreparingOpen}
        onClose={handlePreparingClose}
        fastaUrl={fastaUrl}
      />
    </>
  );
};

export { UsherTreeFlow };
