import { Menu, MenuItem } from "czifui";
import React, { useState } from "react";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import { IconButton } from "../IconButton";
import { StyledMoreActionsIcon, StyledText, StyledTrashIcon } from "./style";

interface Props {
  disabled: boolean;
}

const MoreActionsMenu = ({ disabled }: Props): JSX.Element => {
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

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={disabled}
        svgDisabled={<StyledMoreActionsIcon disabled />}
        svgEnabled={<StyledMoreActionsIcon />}
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
      >
        <MenuItem>
          <StyledTrashIcon />
          <StyledText>Delete Samples</StyledText>
        </MenuItem>
      </Menu>
    </>
  );
};

export { MoreActionsMenu };
