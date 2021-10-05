import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import usherLogo from "src/common/images/usher.png";
import ConfirmDialog from "src/components/FilePicker/components/ConfirmDialog";
import { StyledImg, StyledP } from "./style";

interface Props {
  isOpen: boolean;
  onClose(): void;
}

const UsherConfirmationModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const title = (
    <>
      <StyledImg src={usherLogo as string} />
      <div>You are now leaving Aspen.</div>
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
        onConfirm={() => {
          // TODO (mlila): add in code for opening redirect modal when this
          // TODO   is clicked (work in ticket #161398)
          onClose();
        }}
        title={title}
        content={content}
        footer="It may take a few minutes to process your samples."
      />
    </div>
  );
};

export { UsherConfirmationModal };
