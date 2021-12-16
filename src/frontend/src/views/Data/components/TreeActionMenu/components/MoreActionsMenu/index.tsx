import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import { UserResponse } from "src/common/queries/auth";
import { StyledIcon } from "../../style";
import { DeleteTreeConfirmationModal } from "./components/DeleteTreeConfirmationModal";
import { StyledText, StyledTrashIcon } from "./style";

interface Props {
  item: Tree;
  userInfo: UserResponse;
}

const MoreActionsMenu = ({ item, userInfo }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const { group: userGroup } = userInfo;
  const { group, status } = item;

  const isAutoBuild = group?.name === "";
  const isTreeInUserOrg = userGroup?.name === group?.name;
  const canUserDeleteTree = isAutoBuild || isTreeInUserOrg;
  const isDisabled = status === TREE_STATUS.Started || !canUserDeleteTree;

  let tooltipText = "More Actions";

  if (!isTreeInUserOrg) {
    tooltipText =
      "“More Actions” are only available for your organization’s trees.";
  } else if (isDisabled) {
    tooltipText =
      "“More Actions” will be available after this tree is complete.";
  }

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
