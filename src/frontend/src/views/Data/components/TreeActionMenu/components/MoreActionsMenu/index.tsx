import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { noop } from "src/common/constants/empty";
import { TREE_STATUS } from "src/common/constants/types";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import { useDeleteTrees } from "src/common/queries/trees";
import { StyledIcon } from "../../style";
import { StyledText, StyledTrashIcon } from "./style";

interface Props {
  item: TableItem;
}

const MoreActionsMenu = ({ item }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const { id, status } = item;
  //TODO: also disable if cdph viewing
  const isDisabled = status === TREE_STATUS.Started;

  const handleClick: MouseEventHandler = (event) => {
    if (!isDisabled) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setIsDeleteModalOpen(true);
    handleClose();
  };

  const handleDeleteTree = () => {
    setIsDeleteModalOpen(false);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={tooltipText}
        placement="top"
      >
        <StyledIcon onClick={handleClick} disabled={isDisabled}>
          <MoreActionsIcon />
        </StyledIcon>
      </Tooltip>
      {open && (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            horizontal: "right",
            vertical: "bottom",
          }}
          transformOrigin={{
            horizontal: "right",
            vertical: "top",
          }}
          keepMounted
          open={open}
          onClose={handleClose}
          getContentAnchorEl={null}
        >
          <MenuItem onClick={handleOpenModal}>
            <StyledTrashIcon />
            <StyledText>Delete Tree</StyledText>
          </MenuItem>
        </Menu>
      )}
      <DeleteTreeConfirmationModal
        open={isDeleteModalOpen}
        onClose={handleDeleteTree}
        tree={item}
      />
    </>
  );
};

export { MoreActionsMenu };
