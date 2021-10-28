import { Menu, MenuItem } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import { IconButton } from "../IconButton";
import { StyledTreeBuildDisabledImage, StyledTreeBuildImage } from "./style";

interface Props {
  handleCreateNSTreeOpen: () => void;
  handleCreateUsherTreeOpen: () => void;
  // TODO (mlila): remove isMenuDisabled when gisaidIngest feature turned on
  isMenuDisabled: boolean;
  isUsherDisabled: boolean;
}

const TreeSelectionMenu = ({
  handleCreateNSTreeOpen,
  handleCreateUsherTreeOpen,
  isMenuDisabled,
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

  const TREE_BUILD_TOOLTIP_TEXT = (shouldShowDisabledTooltip: boolean) => (
    <div>
      <TooltipHeaderText>Run Phylogenetic Analysis</TooltipHeaderText>
      {shouldShowDisabledTooltip && (
        <TooltipDescriptionText>
          {"Select at least 1 and <2000 recovered samples"}
        </TooltipDescriptionText>
      )}
    </div>
  );

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={isMenuDisabled}
        svgDisabled={<StyledTreeBuildDisabledImage />}
        svgEnabled={<StyledTreeBuildImage />}
        tooltipTextDisabled={TREE_BUILD_TOOLTIP_TEXT(true)}
        tooltipTextEnabled={TREE_BUILD_TOOLTIP_TEXT(false)}
      />
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
        <MenuItem onClick={handleClickUsher} disabled={isUsherDisabled}>
          UShER Phylogenetic Placement
        </MenuItem>
      </Menu>
    </>
  );
};

export { TreeSelectionMenu };
