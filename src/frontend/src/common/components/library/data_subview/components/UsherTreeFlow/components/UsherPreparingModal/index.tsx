import { LoadingIndicator } from "czifui";
import React, { useCallback, useEffect, useState } from "react";
import { StyledDialog, StyledP, StyledTitle } from "./style";

interface Props {
  fastaUrl: string;
  isOpen: boolean;
  onClose(): void;
}

type TimeoutType = ReturnType<typeof setTimeout> | undefined;

const TIME_MODAL_SHOWN = 5000; // 5 seconds
const USHER_URL =
  "https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&remoteFile=";

const UsherPreparingModal = ({
  fastaUrl,
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const [hasOpenedUrl, setHasOpenedUrl] = useState<boolean>(false);
  const [timer, setTimer] = useState<TimeoutType>();

  const openUsher = useCallback(() => {
    if (!fastaUrl) return;

    const link = document.createElement("a");
    link.href = `${USHER_URL + fastaUrl}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.click();
    link.remove();

    onClose();
    setTimer(undefined);
    if (timer) clearTimeout(timer);
  }, [fastaUrl, onClose, timer]);

  useEffect(() => {
    // The s3 link was cleared by the parent, so future renders of this component
    // should know that any fasta link set in the future has not been opened yet.
    if (!fastaUrl) {
      setHasOpenedUrl(false);
      return;
    }

    // only set a timer to open an usher link if this modal is open.
    // otherwise, we risk opening a link when someone clicks "cancel"
    // from the previous modal.
    // Also, only open the link once :)
    if (isOpen && !hasOpenedUrl) {
      setHasOpenedUrl(true);

      const newTimer = setTimeout(() => {
        openUsher();
      }, TIME_MODAL_SHOWN);

      setTimer(newTimer);
    }
  }, [fastaUrl, hasOpenedUrl, isOpen, onClose, openUsher]);

  return (
    <StyledDialog
      open={isOpen}
      maxWidth="xs"
      onClose={openUsher}
      disableEscapeKeyDown={false}
    >
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
