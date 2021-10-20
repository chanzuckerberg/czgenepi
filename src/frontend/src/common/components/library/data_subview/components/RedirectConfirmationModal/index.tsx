import React from "react";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledHeader, StyledImg, StyledP } from "./style";

interface Props {
  content: string;
  footer?: string;
  img: string;
  isOpen: boolean;
  onClose(): void;
  onConfirm(): void;
}

const RedirectConfirmationModal = ({
  content,
  footer,
  img,
  isOpen,
  onClose,
  onConfirm,
}: Props): JSX.Element => {
  const title = (
    <>
      <StyledImg src={img} />
      <StyledHeader>You are now leaving Aspen.</StyledHeader>
    </>
  );

  const formattedContent = (
    <div>
      <StyledP>{content}</StyledP>
    </div>
  );

  return (
    <div>
      <ConfirmDialog
        open={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        content={formattedContent}
        footer={footer}
      />
    </div>
  );
};

export { RedirectConfirmationModal };
