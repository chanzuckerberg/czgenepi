import React from "react";
import ConfirmDialog from "src/components/ConfirmDialog";
import { StyledButton, StyledSpan } from "./style";

interface Props extends ConfirmDialogProps {
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
      customConfirmButton={deleteButton}
      onConfirm={onDelete}
      title={styledTitle}
      {...props}
    />
  );
};

export { DeleteDialog };
