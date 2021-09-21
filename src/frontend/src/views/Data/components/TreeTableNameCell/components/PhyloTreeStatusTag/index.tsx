import React from "react";
import { StyledChip } from "./style";

interface Props {
  treeStatus: TREE_STATUS;
}

const STATUS_MAP = {
  COMPLETED: "success",
  FAILED: "error",
  STARTED: "beta",
};

const PhyloTreeStatusTag = ({ treeStatus }: Props): JSX.Element => (
  <StyledChip
    isRounded
    label={treeStatus}
    size="small"
    status={STATUS_MAP[treeStatus]}
  />
);

export { PhyloTreeStatusTag };
