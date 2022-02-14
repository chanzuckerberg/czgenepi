import React from "react";
import ConfirmDialog, {
  ConfirmDialogProps,
} from "src/components/ConfirmDialog";
import { StyledSpan, StyledButton } from "src/components/DeleteDialog/style";

interface Props extends Omit<ConfirmDialogProps, "onConfirm"> {
  onDelete(): void;
}

const DeleteDialog = ({
  onDelete,
  open,
  title,
  ...props
}: Props): JSX.Element | null => {
  if (!open) return null;

  const deleteButton = (
    <StyledButton color="primary" variant="contained" isRounded>
      Delete
    </StyledButton>
  );

  const styledTitle = <StyledSpan>{title}</StyledSpan>;

  return (
    <ConfirmDialog
      {...props}
      customConfirmButton={deleteButton}
      onConfirm={onDelete}
      title={styledTitle}
      open={open}
    />
  );
};

export { DeleteDialog };
