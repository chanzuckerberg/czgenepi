import React, { useCallback } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import usherLogo from "src/common/images/usher.png";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledHeader, StyledImg, StyledP } from "./style";

interface Props {
  fastaUrl: string;
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
  treeType: string;
}

const generateUsherLink = (remoteFile: string, treeType: string) => {
  const USHER_URL =
    "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile=";
  const USHER_TREE_TYPE_QUERY = "&phyloPlaceTree=";
  const encodedFileLink = encodeURIComponent(remoteFile);

  return `${USHER_URL}${encodedFileLink}${USHER_TREE_TYPE_QUERY}${treeType}`;
};

const UsherConfirmationModal = ({
  fastaUrl,
  isOpen,
  onClose,
  onConfirm,
  treeType,
}: Props): JSX.Element => {
  const openUsher = useCallback(() => {
    if (!fastaUrl) return;

    const link = document.createElement("a");
    link.href = generateUsherLink(fastaUrl, treeType);
    link.target = "_blank";
    link.rel = "noopener";
    link.click();
    link.remove();

    onClose();
  }, [fastaUrl, onClose, treeType]);

  const handleConfirm = () => {
    openUsher();
    onConfirm();
  };

  const title = (
    <>
      <StyledImg src={usherLogo as string} />
      <StyledHeader>You are now leaving Aspen.</StyledHeader>
    </>
  );

  const content = (
    <div>
      <StyledP>
        By clicking “Continue” you agree to send a copy of your genomic data to
        UCSC’s UShER visualization service, and that you understand this may
        make the data accessible to others. UShER is a separate service from
        Aspen. Your data will be subject to their{" "}
        <NewTabLink href="https://genome.ucsc.edu/conditions.html">
          Conditions of Use
        </NewTabLink>
        .
      </StyledP>
    </div>
  );

  const footer =
    "Your tree will open in a new tab. It may take a few minutes for UShER to prepare your placement.";

  return (
    <div>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        title={title}
        content={content}
        footer={footer}
      />
    </div>
  );
};

export { UsherConfirmationModal };
