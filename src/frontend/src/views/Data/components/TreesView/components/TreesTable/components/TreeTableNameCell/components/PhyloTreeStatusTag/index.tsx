import { Tooltip } from "czifui";
import { TREE_STATUS } from "src/common/constants/types";
import { StyledChip } from "./style";

// TODO (mlila): this should actually be exported from sds
export type CHIP_STATUS =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "beta";

interface Props {
  treeStatus: TREE_STATUS;
}

const STATUS_MAP: Record<TREE_STATUS, CHIP_STATUS> = {
  [TREE_STATUS.Completed]: "success",
  [TREE_STATUS.Failed]: "error",
  [TREE_STATUS.Started]: "beta",
};

const PhyloTreeStatusTag = ({ treeStatus }: Props): JSX.Element => {
  const Chip = (
    <StyledChip
      isRounded
      label={treeStatus}
      size="small"
      status={STATUS_MAP[treeStatus]}
    />
  );

  if (treeStatus === TREE_STATUS.Failed) {
    return (
      <Tooltip
        arrow
        title="Trees may fail if no samples satisfy the specified location, date, or lineage."
        sdsStyle="light"
      >
        <span>{Chip}</span>
      </Tooltip>
    );
  }

  return Chip;
};

export { PhyloTreeStatusTag };
