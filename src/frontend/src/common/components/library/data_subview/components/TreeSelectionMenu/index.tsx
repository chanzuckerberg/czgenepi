import { Menu, MenuItem } from "czifui";
import React from "react";
import { IconButton } from "../IconButton";
import { StyledTreeBuildDisabledImage, StyledTreeBuildImage } from "./style";

interface Props {
  isDisabled: boolean;
}

const TreeSelectionMenu = ({ isDisabled }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
        disabled={isDisabled}
        svgDisabled={<StyledTreeBuildDisabledImage />}
        svgEnabled={<StyledTreeBuildImage />}
        tooltipTextDisabled={TREE_BUILD_TOOLTIP_TEXT(true)}
        tooltipTextEnabled={TREE_BUILD_TOOLTIP_TEXT(false)}
      />
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <MenuItem onClick={handleClose}>Nextstrain Phlyogenetic Tree</MenuItem>
        <MenuItem onClick={handleClose}>UShER Phylogenetic Placement</MenuItem>
      </Menu>
    </>
  );
};

export { TreeSelectionMenu };
