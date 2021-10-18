import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import usherLogo from "src/common/images/usher.png";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledHeader, StyledImg, StyledP } from "./style";

interface Props {
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
}

const UsherConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
}: Props): JSX.Element => {
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

  return (
    <div>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        content={content}
        footer="It may take a few minutes to process your samples."
      />
    </div>
  );
};

export { UsherConfirmationModal };
