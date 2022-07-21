import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import { StyledEditIcon, StyledTrashIcon } from "src/common/styles/iconStyle";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { StyledIcon, StyledIconWrapper } from "../../style";
import { StyledText } from "./style";

interface Props {
  item: PhyloRun;
  onDeleteTreeModalOpen(t: PhyloRun): void;
  onEditTreeModalOpen(t: PhyloRun): void;
  userInfo: User;
}

const MoreActionsMenu = ({
  item,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
  userInfo,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const { group, status } = item;

  const isAutoBuild = group?.name === "";
  const isTreeInUserOrg = currentGroup?.name === group?.name;
  const canUserDeleteTree = isAutoBuild || isTreeInUserOrg;
  // FIXME: allow users to edit/delete FAILED runs once phylotrees V2 endpoint has been updated to better reflect tree status
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
