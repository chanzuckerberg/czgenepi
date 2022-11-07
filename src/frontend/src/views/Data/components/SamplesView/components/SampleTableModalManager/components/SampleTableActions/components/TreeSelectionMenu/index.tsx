import { Menu, MenuItem, Tooltip } from "czifui";
import { MouseEventHandler, useState } from "react";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import { IconButton } from "../IconButton";

interface Props {
  openNSTreeModal: () => void;
  openUsherModal: () => void;
  isMenuDisabled: boolean;
  isUsherDisabled: boolean;
}

const TreeSelectionMenu = ({
  openNSTreeModal,
  openUsherModal,
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
    openNSTreeModal();
    handleClose();
  };

  const handleClickUsher = () => {
    openUsherModal();
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

  const USHER_DISABLED_TEXT =
    "You must select at least 1 CZ GEN EPI sample to create an UShER Placement.";

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={isMenuDisabled}
        sdsIcon="treeHorizontal"
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
        data-test-id="run-nextstrain-phylo-analysis-icon"
      >
        <MenuItem onClick={handleClickNS} data-test-id="nextstrain-phylo-tree">
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
