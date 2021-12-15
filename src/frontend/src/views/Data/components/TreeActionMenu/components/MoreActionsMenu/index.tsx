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

  const deleteTreeMutation = useDeleteTrees({
    onSuccess: noop,
    onError: noop,
  });

  // TODO (mlila): add callback here when adding delete functionality
  const handleDeleteTrees = () => {
    deleteTreeMutation.mutate({
      treeIdToDelete: id,
    });
    handleClose();
  };

  return (
    <>
      <Tooltip
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={
          isDisabled
            ? "“More Actions” will be available after this tree is complete."
            : "More Actions"
        }
        placement="top"
      >
        <StyledIcon onClick={handleClick} disabled={isDisabled}>
          <MoreActionsIcon />
        </StyledIcon>
      </Tooltip>
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
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={handleDeleteTrees}>
          <StyledTrashIcon />
          <StyledText>Delete Tree</StyledText>
        </MenuItem>
      </Menu>
    </>
  );
};

export { MoreActionsMenu };
