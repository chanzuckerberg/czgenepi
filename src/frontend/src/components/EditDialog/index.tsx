import React from "react";
import ConfirmDialog, {
  ConfirmDialogProps,
} from "src/components/ConfirmDialog";
import { StyledSpan } from "src/components/DeleteDialog/style";

interface Props extends Omit<ConfirmDialogProps, "onConfirm"> {
  onEdit(): void;
}

const EditDialog = ({
  onEdit,
  open,
  title,
  ...props
}: Props): JSX.Element | null => {
  if (!open) return null;

  const styledTitle = <StyledSpan>{title}</StyledSpan>;

  return (
    <ConfirmDialog
      {...props}
      onConfirm={onEdit}
      title={styledTitle}
      open={open}
      withCloseIcon={true}
      disableBackdropClick={false}
      isConfirmButtonClickable={false}
    />
  );
};

export { EditDialog };
