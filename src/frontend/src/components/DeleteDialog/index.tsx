import React from "react";
import ConfirmDialog, {
  ConfirmDialogProps,
} from "src/components/ConfirmDialog";
import { StyledButton, StyledSpan } from "./style";

interface Props extends Omit<ConfirmDialogProps, "onConfirm"> {
  onDelete(): void;
}

const DeleteDialog = ({
  onDelete,
  title,
  ...props
}: Props): JSX.Element | null => {
  if (!open) return null;

  const styledTitle = <StyledSpan>{title}</StyledSpan>;

  const deleteButton = (
    <StyledButton color="primary" variant="contained" isRounded>
      Delete
    </StyledButton>
  );

  return (
    <ConfirmDialog
      {...props}
      customConfirmButton={deleteButton}
      onConfirm={onDelete}
      title={styledTitle}
    />
  );
};

export { DeleteDialog };
