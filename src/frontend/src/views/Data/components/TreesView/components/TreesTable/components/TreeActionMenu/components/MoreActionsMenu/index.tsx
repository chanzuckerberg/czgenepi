import { ButtonIcon, Icon, Menu, MenuItem, Tooltip } from "czifui";
import { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import { useUserInfo } from "src/common/queries/auth";
import { StyledMenuItemWrapper } from "src/common/styles/menuStyle";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import {
  StyledEditIconWrapper,
  StyledText,
  StyledTrashIconWrapper,
} from "./style";

interface Props {
  item: PhyloRun;
  onDeleteTreeModalOpen(t: PhyloRun): void;
  onEditTreeModalOpen(t: PhyloRun): void;
}

const MoreActionsMenu = ({
  item,
  onDeleteTreeModalOpen,
  onEditTreeModalOpen,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const { data: userInfo } = useUserInfo();
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const { group, name, status } = item;

  const isAutoBuild = group?.name === "";
  const isTreeInUserOrg = currentGroup?.name === group?.name;
  const canUserDeleteTree = isAutoBuild || isTreeInUserOrg;
  // TODO: allow users to edit/delete FAILED runs once phylotrees V2 endpoint has been updated
  // TODO: to better reflect tree status
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
        <span>
          <ButtonIcon
            aria-label={`more actions for ${name}`}
            disabled={isDisabled}
            onClick={handleClick}
            sdsSize="small"
            sdsType="primary"
            size="large"
          >
            <Icon sdsIcon="dotsHorizontal" sdsSize="s" sdsType="iconButton" />
          </ButtonIcon>
        </span>
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
        >
          <MenuItem
            onClick={() => onEditTreeModalOpen(item)}
            data-test-id="edit-tree-name-item"
          >
            <StyledMenuItemWrapper>
              <StyledEditIconWrapper>
                <Icon sdsIcon="edit" sdsSize="xs" sdsType="static" />
              </StyledEditIconWrapper>
              <StyledText>Edit Tree Name</StyledText>
            </StyledMenuItemWrapper>
          </MenuItem>
          <MenuItem
            onClick={() => onDeleteTreeModalOpen(item)}
            data-test-id="edit-tree-name-item"
          >
            <StyledMenuItemWrapper>
              <StyledTrashIconWrapper>
                <Icon sdsIcon="trashCan" sdsSize="xs" sdsType="static" />
              </StyledTrashIconWrapper>
              <StyledText isWarning>Delete Tree</StyledText>
            </StyledMenuItemWrapper>
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

export { MoreActionsMenu };
