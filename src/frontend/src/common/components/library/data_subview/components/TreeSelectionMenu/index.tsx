import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { IconButtonBubble } from "src/common/styles/support/style";
import { TooltipHeaderText } from "../../style";
import { StyledTreeBuildImage } from "./style";

interface Props {
  handleCreateNSTreeOpen: () => void;
  handleCreateUsherTreeOpen: () => void;
  isUsherDisabled: boolean;
}

const TreeSelectionMenu = ({
  handleCreateNSTreeOpen,
  handleCreateUsherTreeOpen,
  isUsherDisabled,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickNS = () => {
    handleCreateNSTreeOpen();
    handleClose();
  };

  const handleClickUsher = () => {
    handleCreateUsherTreeOpen();
    handleClose();
  };

  const TREE_BUILD_TOOLTIP_TEXT = (
    <div>
      <TooltipHeaderText>Run Phylogenetic Analysis</TooltipHeaderText>
    </div>
  );

  const USHER_DISABLED_TEXT =
    "You must select at least 1 Aspen sample to create an UShER Placement.";

  return (
    <>
      <Tooltip arrow inverted title={TREE_BUILD_TOOLTIP_TEXT} placement="top">
        <IconButtonBubble onClick={handleClick}>
          <StyledTreeBuildImage />
        </IconButtonBubble>
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
        <MenuItem onClick={handleClickNS}>
          Nextstrain Phylogenetic Tree
        </MenuItem>
        <Tooltip
          arrow
          disableHoverListener={!isUsherDisabled}
          placement="bottom"
          title={USHER_DISABLED_TEXT}
        >
          <div>
            <MenuItem onClick={handleClickUsher} disabled={isUsherDisabled}>
              UShER Phylogenetic Placement
            </MenuItem>
          </div>
        </Tooltip>
      </Menu>
    </>
  );
};

export { TreeSelectionMenu };
