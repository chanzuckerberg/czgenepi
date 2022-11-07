import { ButtonIcon, Icon, Tooltip } from "czifui";
import { FC, useState } from "react";
import { StyledBadge, StyledDiv, tooltipStyles } from "./style";

interface Props {
  activeFilterCount: number;
  onClick: () => void;
}

export const FilterPanelToggle: FC<Props> = ({
  activeFilterCount,
  onClick,
}): JSX.Element => {
  const [isActive, setIsActive] = useState<boolean>(true);

  const handleclick = () => {
    setIsActive(!isActive);
    onClick();
  };

  return (
    <Tooltip
      arrow
      sdsStyle="dark"
      enterDelay={1000}
      title="Filters"
      placement="bottom"
      classes={{ tooltip: tooltipStyles }}
    >
      <StyledDiv>
        <ButtonIcon
          aria-label={`${activeFilterCount} active filters`}
          active={isActive}
          onClick={handleclick}
          sdsSize="large"
          sdsType="secondary"
          size="large"
        >
          <Icon sdsIcon="slidersHorizontal" sdsSize="l" sdsType="static" />
          {activeFilterCount > 0 && (
            <StyledBadge>{activeFilterCount}</StyledBadge>
          )}
        </ButtonIcon>
      </StyledDiv>
    </Tooltip>
  );
};
