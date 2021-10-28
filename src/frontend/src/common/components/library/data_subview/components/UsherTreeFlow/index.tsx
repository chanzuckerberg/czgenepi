import React, { useEffect, useState } from "react";
import Notification from "src/components/Notification";
import { StyledNewTabLink } from "../../style";
import { UsherConfirmationModal } from "./components/UsherConfirmationModal";
import { UsherPlacementModal } from "./components/UsherPlacementModal";

interface Props {
  checkedSamples: string[];
  failedSamples: string[];
  shouldStartUsherFlow: boolean;
}

const generateUsherLink = (remoteFile: string, treeType: string) => {
  const USHER_URL =
    "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile=";
  const USHER_TREE_TYPE_QUERY = "&phyloPlaceTree=";
  const encodedFileLink = encodeURIComponent(remoteFile);

  return `${USHER_URL}${encodedFileLink}${USHER_TREE_TYPE_QUERY}${treeType}`;
};

const UsherTreeFlow = ({
  checkedSamples,
  failedSamples,
  shouldStartUsherFlow,
}: Props): JSX.Element => {
  const [isPlacementOpen, setIsPlacementOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isAlertShown, setIsAlertShown] = useState<boolean>(false);
  const [usherLink, setUsherLink] = useState<string>("");

  useEffect(() => {
    if (shouldStartUsherFlow) setIsPlacementOpen(true);
  }, [shouldStartUsherFlow]);

  const openUsher = () => {
    if (!usherLink) return;

    const link = document.createElement("a");
    link.href = usherLink;
    link.target = "_blank";
    link.rel = "noopener";
    link.click();
    link.remove();
  };

  const onLinkCreateSuccess = (url: string, treeType: string) => {
    const usherLink = generateUsherLink(url, treeType);
    setUsherLink(usherLink);
    setIsConfirmOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsPlacementOpen(false);
    setIsConfirmOpen(false);
    setUsherLink("");
  };

  const handleConfirmationConfirm = () => {
    openUsher();
    setIsConfirmOpen(false);
    setIsPlacementOpen(false);
    setIsAlertShown(true);
  };

  const handleAlertClose = () => {
    setIsAlertShown(false);
    setUsherLink("");
  };

  return (
    <>
      <UsherPlacementModal
        sampleIds={checkedSamples}
        failedSamples={failedSamples}
        open={isPlacementOpen}
        onClose={() => setIsPlacementOpen(false)}
        onLinkCreateSuccess={onLinkCreateSuccess}
      />
      <UsherConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
      />
      {isAlertShown && (
        <Notification
          buttonOnClick={handleAlertClose}
          buttonText="DISMISS"
          dismissDirection="right"
          intent="info"
        >
          Your samples were successfuly sent to UShER. It may take a few minutes
          for your placement to load.{" "}
          <StyledNewTabLink href={usherLink}>
            View your placement
          </StyledNewTabLink>
          .
        </Notification>
      )}
    </>
  );
};

export { UsherTreeFlow };
