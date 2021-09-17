import { SvgIcon } from "@material-ui/core";
import { IconButton, Tooltip } from "czifui";
import React, { FC, useState } from "react";
import IconFilters from "src/common/icons/IconFilters.svg";
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
      inverted
      enterDelay={1000}
      title="Filters"
      placement="bottom"
      classes={{ tooltip: tooltipStyles }}
    >
      <StyledDiv>
        <IconButton
          active={isActive}
          onClick={handleclick}
          sdsSize="large"
          sdsType="secondary"
        >
          <SvgIcon viewBox="0 0 32 32" component={IconFilters} />
          {activeFilterCount > 0 && (
            <StyledBadge>{activeFilterCount}</StyledBadge>
          )}
        </IconButton>
      </StyledDiv>
    </Tooltip>
  );
};
