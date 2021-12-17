import { Tooltip } from "czifui";
import React, { useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import OpenInNewIcon from "src/common/icons/IconOpenSmall.svg";
import NextstrainConfirmationModal from "../../../NextstrainConfirmationModal";
import { StyledIcon } from "../../style";

interface Props {
  item: TableItem;
}

const OpenInNextstrainButton = ({ item }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { id, status } = item;
  const isDisabled = status !== TREE_STATUS.Completed;

  const handleClickOpen = () => {
    if (!isDisabled) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={
          isDisabled
            ? "“View in Nextstrain” is only available for completed trees."
            : "View in Nextstrain"
        }
        placement="top"
      >
        <StyledIcon onClick={handleClickOpen} disabled={isDisabled}>
          <OpenInNewIcon />
        </StyledIcon>
      </Tooltip>
      <NextstrainConfirmationModal
        open={open}
        onClose={handleClose}
        treeId={id as number}
      />
    </>
  );
};

export { OpenInNextstrainButton };
