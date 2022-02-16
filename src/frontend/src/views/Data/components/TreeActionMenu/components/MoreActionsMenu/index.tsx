import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import { UserResponse } from "src/common/queries/auth";
import { StyledEditIcon, StyledTrashIcon } from "src/common/styles/iconStyle";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { StyledIcon, StyledIconWrapper } from "../../style";
import { StyledText } from "./style";

interface Props {
  item: Tree;
  onDeleteTreeModalOpen(t: Tree): void;
  userInfo: UserResponse;
}

const MoreActionsMenu = ({
  item,
  onDeleteTreeModalOpen,
  userInfo,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

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
          {usesFeatureFlag(FEATURE_FLAGS.editTrees) && (
            <MenuItem onClick={() => undefined}>
              <StyledEditIcon />
              <StyledText>Edit Tree Name</StyledText>
            </MenuItem>
          )}
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
