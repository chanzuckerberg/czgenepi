import type { IconNameToSizes } from "czifui";
import { Icon, IconButton as LibIconButton, Tooltip } from "czifui";
import React, { FunctionComponent, MouseEventHandler, useState } from "react";
import { StyledSpan } from "./style";

interface Props {
  onClick: MouseEventHandler;
  disabled: boolean;
  sdsIcon: keyof IconNameToSizes;
  tooltipTextEnabled: JSX.Element;
  tooltipTextDisabled: JSX.Element;
}

export const IconButton: FunctionComponent<Props> = ({
  onClick,
  disabled,
  sdsIcon,
  tooltipTextEnabled,
  tooltipTextDisabled,
}: Props) => {
  const [active, setActive] = useState<boolean>(false);
  const handleClick = (e: React.MouseEvent) => {
    setActive(!active);
    onClick(e);
  };

  return (
    <Tooltip
      arrow
      sdsStyle="dark"
      title={disabled ? tooltipTextDisabled : tooltipTextEnabled}
      placement="top"
    >
      <StyledSpan>
        <LibIconButton
          onClick={handleClick}
          disabled={disabled}
          sdsSize="large"
          sdsType="primary"
        >
          <Icon sdsIcon={sdsIcon} sdsSize="xl" sdsType="iconButton" />
        </LibIconButton>
      </StyledSpan>
    </Tooltip>
  );
};
