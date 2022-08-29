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

interface MapType {
  [key: string]: CHIP_STATUS;
}

const STATUS_MAP: MapType = {
  COMPLETED: "success",
  FAILED: "error",
  STARTED: "beta",
};

const PhyloTreeStatusTag = ({ treeStatus }: Props): JSX.Element => (
  <StyledChip
    isRounded
    label={treeStatus}
    size="small"
    status={STATUS_MAP[treeStatus] as CHIP_STATUS}
  />
);

export { PhyloTreeStatusTag };
