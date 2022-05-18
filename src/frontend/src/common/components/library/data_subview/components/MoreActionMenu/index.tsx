import { Menu, MenuItem, Tooltip } from "czifui";
import React, { MouseEventHandler, useState } from "react";
import { StyledEditIcon, StyledTrashIcon } from "src/common/styles/iconStyle";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { StyledText } from "src/views/Data/components/TreeActionMenu/components/MoreActionsMenu/style";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import { IconButton } from "../IconButton";

interface Props {
  disabled: boolean;
  isSampleEditDisabled: boolean;
  onDeleteSelected(): void;
  onEditSelected(): void;
}

const MoreActionsMenu = ({
  disabled,
  isSampleEditDisabled,
  onDeleteSelected,
  onEditSelected,
}: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const TOOLTIP_TEXT_DISABLED = (
    <div>
      <TooltipHeaderText>More Actions</TooltipHeaderText>
      <TooltipDescriptionText>Select at least 1 sample</TooltipDescriptionText>
    </div>
  );

  const TOOLTIP_TEXT_ENABLED = (
    <div>
      <TooltipHeaderText>More Actions</TooltipHeaderText>
    </div>
  );

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteSamples = () => {
    onDeleteSelected();
    handleClose();
  };

  const handleEditSamples = () => {
    onEditSelected();
    handleClose();
  };

  const sampleEditDisabledTooltipContent =
    "You can only edit 100 samples or less at a time.";
  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        sdsIcon="dotsHorizontal"
        tooltipTextDisabled={TOOLTIP_TEXT_DISABLED}
        tooltipTextEnabled={TOOLTIP_TEXT_ENABLED}
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
        <Tooltip
          arrow
          disableHoverListener={!isSampleEditDisabled}
          placement="top"
          title={sampleEditDisabledTooltipContent}
        >
          <div>
            <MenuItem
              onClick={handleEditSamples}
              disabled={isSampleEditDisabled}
            >
              <StyledEditIcon />
              <StyledText>Edit Samples</StyledText>
            </MenuItem>
          </div>
        </Tooltip>
        <MenuItem onClick={handleDeleteSamples}>
          <StyledTrashIcon />
          <StyledText isWarning>Delete Samples</StyledText>
        </MenuItem>
      </Menu>
    </>
  );
};

export { MoreActionsMenu };
