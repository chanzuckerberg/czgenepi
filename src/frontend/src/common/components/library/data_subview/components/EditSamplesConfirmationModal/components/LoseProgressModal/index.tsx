import React from "react";
import ConfirmDialog from "src/components/ConfirmDialog";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen(x: boolean): void;
  onClose(): void;
  clearState(): void;
}

export const LoseProgressModal = ({
  isModalOpen,
  setIsModalOpen,
  onClose,
  clearState,
}: Props): JSX.Element => {
  const title = "Leave sample editing?";
  const message =
    "If you leave, your current edits will be canceled and your work will not be saved.";

  const handleCloseAfterConfirmation = function () {
    // user confirms that they would like to leave edit and lose progress
    clearState();
    onClose();
  };

  const handleLoseProgressModalClose = function () {
    // User wants to return to edit and not abandon changes
    setIsModalOpen(false);
  };

  return (
    <ConfirmDialog
      onConfirm={handleCloseAfterConfirmation}
      open={isModalOpen}
      onClose={handleLoseProgressModalClose}
      cancelButtonText="Return To Edit"
      continueButtonText="Leave"
      title={title}
      content={message}
    />
  );
};
