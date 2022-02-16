import { Tooltip } from "czifui";
import React, { FunctionComponent, MouseEventHandler } from "react";
import { IconButtonBubble } from "src/common/styles/iconStyle";
import { StyledSpan } from "./style";

interface Props {
  onClick: MouseEventHandler;
  disabled: boolean;
  svgEnabled: JSX.Element;
  svgDisabled: JSX.Element;
  tooltipTextEnabled: JSX.Element;
  tooltipTextDisabled: JSX.Element;
}

export const IconButton: FunctionComponent<Props> = ({
  onClick,
  disabled,
  svgEnabled,
  svgDisabled,
  tooltipTextEnabled,
  tooltipTextDisabled,
}: Props) => {
  return (
    <Tooltip
      arrow
      sdsStyle="dark"
      title={disabled ? tooltipTextDisabled : tooltipTextEnabled}
      placement="top"
    >
      <StyledSpan>
        <IconButtonBubble onClick={onClick} disabled={disabled}>
          {disabled ? svgDisabled : svgEnabled}
        </IconButtonBubble>
      </StyledSpan>
    </Tooltip>
  );
};
