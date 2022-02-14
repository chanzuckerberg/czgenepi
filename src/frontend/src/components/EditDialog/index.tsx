import React from "react";
import BaseDialog from "src/components/BaseActionDialog";
import { StyledSpan } from "src/components/DeleteDialog/style";



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
