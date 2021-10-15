import { LoadingIndicator } from "czifui";
import React, { useEffect } from "react";
import { StyledDialog, StyledP, StyledTitle } from "./style";

interface Props {
  isOpen: boolean;
  onClose(): void;
  usherFastaUrl: string;
}

const TIME_MODAL_SHOWN = 8000; // 8 seconds
const USHER_URL =
  "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile=";

const UsherPreparingModal = ({
  isOpen,
  onClose,
  usherFastaUrl,
}: Props): JSX.Element => {
  useEffect(() => {
    if (!usherFastaUrl) return;

    setTimeout(() => {
      const link = document.createElement("a");
      link.href = `${USHER_URL + usherFastaUrl}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.click();
      link.remove();
      onClose();
    }, TIME_MODAL_SHOWN);
  });

  return (
    <StyledDialog open={isOpen} maxWidth="xs">
      <div>
        <LoadingIndicator sdsStyle="tag" />
      </div>
      <StyledTitle>UShER is placing your samples...</StyledTitle>
      <StyledP>
        Your UShER phylogenetic sample placement will open automatically in a
        new tab. It may take a few minutes for your placement to be ready.
      </StyledP>
    </StyledDialog>
  );
};

export { UsherPreparingModal };
