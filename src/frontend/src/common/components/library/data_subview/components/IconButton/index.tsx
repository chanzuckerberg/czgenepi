// TODO_TR (mlila): delete this file after table refactor complete
import type { IconNameToSizes } from "czifui";
import { ButtonIcon as LibButtonIcon, Icon, Tooltip } from "czifui";
import { FunctionComponent, MouseEventHandler, useState } from "react";
import { StyledSpan } from "./style";

interface Props {
  onClick: MouseEventHandler;
  disabled: boolean;
  sdsIcon: keyof IconNameToSizes;
  size?: "small" | "medium" | "large";
  tooltipTextEnabled: JSX.Element;
  tooltipTextDisabled: JSX.Element;
}

export const IconButton: FunctionComponent<Props> = ({
  onClick,
  disabled,
  sdsIcon,
  size = "large",
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
        <LibButtonIcon
          onClick={handleClick}
          disabled={disabled}
          sdsSize={size}
          sdsType="primary"
        >
          <Icon sdsIcon={sdsIcon} sdsSize="xl" sdsType="iconButton" />
        </LibButtonIcon>
      </StyledSpan>
    </Tooltip>
  );
};
