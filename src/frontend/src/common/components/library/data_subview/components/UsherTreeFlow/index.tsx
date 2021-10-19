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
  const [selectedTreeType, setSelectedTreeType] = useState<string>("");

  useEffect(() => {
    if (shouldStartUsherFlow) handlePlacementOpen();
  }, [shouldStartUsherFlow]);

  const handlePlacementOpen = () => {
    setIsPlacementOpen(true);
  };

  const handlePlacementClose = () => {
    setFastaUrl("");
    setSelectedTreeType("");
    setIsPlacementOpen(false);
  };

  const onLinkCreateSuccess = (url: string, treeType: string) => {
    setFastaUrl(url);
    setIsConfirmOpen(true);
    setSelectedTreeType(treeType);
  };

  const handleConfirmationClose = () => {
    handlePlacementClose();
    setIsConfirmOpen(false);
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
        fastaUrl={fastaUrl}
        isOpen={isPreparingOpen}
        onClose={handlePreparingClose}
        treeType={selectedTreeType}
      />
    </>
  );
};

export { UsherTreeFlow };
