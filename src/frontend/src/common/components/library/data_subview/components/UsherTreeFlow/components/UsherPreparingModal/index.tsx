import { LoadingIndicator } from "czifui";
import React, { useEffect, useState } from "react";
import { StyledDialog, StyledP, StyledTitle } from "./style";

interface Props {
  fastaUrl: string;
  isOpen: boolean;
  onClose(): void;
}

const TIME_MODAL_SHOWN = 8000; // 8 seconds
const USHER_URL =
  "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile=";

const UsherPreparingModal = ({
  fastaUrl,
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const [hasOpenedUrl, setHasOpenedUrl] = useState<boolean>(false);

  useEffect(() => {
    if (!fastaUrl) {
      setHasOpenedUrl(false);
      return;
    }

    if (!hasOpenedUrl) {
      setHasOpenedUrl(true);
      setTimeout(() => {
        if (!fastaUrl) return;

        const link = document.createElement("a");
        link.href = `${USHER_URL + fastaUrl}`;
        link.target = "_blank";
        link.rel = "noopener";
        link.click();
        link.remove();

        onClose();
      }, TIME_MODAL_SHOWN);
    }
  }, [fastaUrl, hasOpenedUrl, onClose]);

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
