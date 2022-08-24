import { Button } from "czifui";
import BaseDialog from "src/components/BaseDialog";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string | JSX.Element;
  content: string | JSX.Element;
  footer?: string;
  customConfirmButton?: JSX.Element;
  withCloseIcon?: boolean;
  disableBackdropClick?: boolean;
  isConfirmButtonClickable?: boolean;
  cancelButtonText?: string;
  continueButtonText?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  customConfirmButton,
  disableBackdropClick = true,
  title,
  content,
  footer,
  cancelButtonText = "Cancel",
  continueButtonText = "Continue",
}: ConfirmDialogProps): JSX.Element {
  const confirmButton = (
    <div onClick={onConfirm}>
      {customConfirmButton ?? (
        <Button sdsType="primary" sdsStyle="rounded">
          {continueButtonText}
        </Button>
      )}
    </div>
  );

  const cancelButton = (
    <Button sdsType="secondary" sdsStyle="rounded" onClick={onClose}>
      {cancelButtonText}
    </Button>
  );

  return (
    <BaseDialog
      disableBackdropClick={disableBackdropClick}
      open={open}
      onClose={onClose}
      title={title}
      content={content}
      actionButton={confirmButton}
      cancelButton={cancelButton}
      footer={footer}
    />
  );
}
