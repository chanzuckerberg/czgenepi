import ConfirmDialog from "src/components/ConfirmDialog";

interface Props {
  isModalOpen: boolean;
  onClose(): void;
  onConfirm(): void;
}

export const LoseProgressModal = ({
  isModalOpen,
  onClose,
  onConfirm,
}: Props): JSX.Element => {
  const title = "Leave sample editing?";
  const message =
    "If you leave, your current edits will be canceled and your work will not be saved.";

  return (
    <ConfirmDialog
      onConfirm={onConfirm}
      open={isModalOpen}
      onClose={onClose}
      cancelButtonText="Return To Edit"
      continueButtonText="Leave"
      title={title}
      content={message}
    />
  );
};
