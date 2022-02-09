import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import { UserResponse } from "src/common/queries/auth";
import { StyledIcon, StyledIconWrapper } from "../../style";
import { StyledEditIcon, StyledText, StyledTrashIcon } from "./style";

interface Props {
  item: Tree;
  onDeleteTreeModalOpen(t: Tree): void;
  onEditTreeModalOpen(t: Tree): void;
  userInfo: UserResponse;
}

const MoreActionsMenu = ({
  item,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
  userInfo,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const { group: userGroup } = userInfo;
  const { group, status } = item;

  const isAutoBuild = group?.name === "";
  const isTreeInUserOrg = userGroup?.name === group?.name;
  const canUserDeleteTree = isAutoBuild || isTreeInUserOrg;
  // Fix this to allow users to edit/delete FAILED runs once phylotrees V2 endpoint has been updated to better reflect tree status
  const isDisabled = status !== TREE_STATUS.Completed || !canUserDeleteTree;

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

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={tooltipText}
        placement="top"
      >
        <StyledIconWrapper onClick={handleClick}>
          <StyledIcon disabled={isDisabled}>
            <MoreActionsIcon />
          </StyledIcon>
        </StyledIconWrapper>
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
          <MenuItem onClick={() => onEditTreeModalOpen(item)}>
            <StyledEditIcon />
            <StyledText>Edit Tree Name</StyledText>
          </MenuItem>
          <MenuItem onClick={() => onDeleteTreeModalOpen(item)}>
            <StyledTrashIcon />
            <StyledText isWarning>Delete Tree</StyledText>
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export { MoreActionsMenu };
