import { LoadingIndicator } from "czifui";
import React, { useEffect } from "react";
import { StyledDialog, StyledP, StyledTitle } from "./style";

interface Props {
  isOpen: boolean;
  onClose(): void;
}

const TIME_MODAL_SHOWN = 8000; // 8 seconds

const UsherPreparingModal = ({ isOpen, onClose }: Props): JSX.Element => {
  useEffect(() => {
    setTimeout(() => {
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
