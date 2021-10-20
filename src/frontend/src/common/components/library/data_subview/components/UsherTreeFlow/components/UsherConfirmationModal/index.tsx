import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import usherLogo from "src/common/images/usher.png";
import { RedirectConfirmationModal } from "../../../RedirectConfirmationModal";

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
  const content = (
    <>
      By clicking “Continue” you agree to send a copy of your genomic data to
      UCSC’s UShER visualization service, and that you understand this may make
      the data accessible to others. UShER is a separate service from Aspen.
      Your data will be subject to their{" "}
      <NewTabLink href="https://genome.ucsc.edu/conditions.html">
        Conditions of Use
      </NewTabLink>
      .
    </>
  );

  return (
    <div>
      <RedirectConfirmationModal
        content={content}
        footer="It may take a few minutes to process your samples."
        img={usherLogo as string}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </div>
  );
};

export { UsherConfirmationModal };
