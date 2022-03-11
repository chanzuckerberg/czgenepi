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
  open,
  title,
  ...props
}: Props): JSX.Element | null => {
  if (!open) return null;

  const deleteButton = (
    <StyledButton sdsType="primary" sdsStyle="rounded">
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
