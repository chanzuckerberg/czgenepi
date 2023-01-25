import { ChipProps, Tooltip } from "czifui";
import { useState } from "react";
import { StyledChip } from "./style";

interface Props {
  label: string;
  status: ChipProps["status"];
  tooltipText: JSX.Element;
}

const StatusChip = ({ label, status, tooltipText }: Props): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  return (
    <Tooltip
      arrow
      title={tooltipText}
      placement="top"
      PopperProps={{
        anchorEl,
      }}
    >
      <span onMouseOver={(e) => setAnchorEl(e.currentTarget)}>
        <StyledChip
          data-test-id="row-sample-status"
          size="small"
          label={label}
          status={status}
        />
      </span>
    </Tooltip>
  );
};

export { StatusChip };
