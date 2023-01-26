import { ButtonIcon, Icon, Menu, MenuItem, Tooltip } from "czifui";
import { MouseEventHandler, useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import { useUserInfo } from "src/common/queries/auth";
import { StyledMenuItemWrapper } from "src/common/styles/menuStyle";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { DeleteTreeConfirmationModal } from "./components/DeleteTreeConfirmationModal";
import { EditTreeConfirmationModal } from "./components/EditTreeConfirmationModal";
import {
  StyledEditIconWrapper,
  StyledText,
  StyledTrashIconWrapper,
} from "./style";

interface Props {
  phyloRun: PhyloRun;
}

const MoreActionsMenu = ({ phyloRun }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [isEditTreeModalOpen, setIsEditTreeModalOpen] =
    useState<boolean>(false);
  const [isDeleteTreeModalOpen, setIsDeleteTreeModalOpen] =
    useState<boolean>(false);

  const { data: userInfo } = useUserInfo();
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const { group, name, status } = phyloRun;

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

  const handleOpenEditModal = () => {
    setIsEditTreeModalOpen(true);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteTreeModalOpen(true);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <EditTreeConfirmationModal
        open={isEditTreeModalOpen}
        phyloRun={phyloRun}
        onClose={() => setIsEditTreeModalOpen(false)}
      />
      <DeleteTreeConfirmationModal
        open={isDeleteTreeModalOpen}
        phyloRun={phyloRun}
        onClose={() => setIsDeleteTreeModalOpen(false)}
      />
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
            onClick={handleOpenEditModal}
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
            onClick={handleOpenDeleteModal}
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
