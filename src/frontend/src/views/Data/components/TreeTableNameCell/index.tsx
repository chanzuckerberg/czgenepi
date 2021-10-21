import React, { useState } from "react";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { TREE_STATUS } from "src/common/constants/types";
import TreeIcon from "src/common/icons/PhyloTree.svg";
import TreeVizModal from "../TreeVizModal";
import { PhyloTreeStatusTag } from "./components/PhyloTreeStatusTag";
import { CellWrapper, StyledOpenInNewIcon, StyledRowContent } from "./style";

interface NameProps {
  value: string;
  item: Tree;
}

const TreeTableNameCell = ({ value, item }: NameProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const status = item?.status;
  const isDisabled = status !== TREE_STATUS.Completed;

  const handleClickOpen = () => {
    if (!isDisabled) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // TODO: Create a pathway to handle Trees with no id, for trees
  // that are in progress or failed
  const treeId = item.id as number;

  return (
    <>
      <TreeVizModal open={open} onClose={handleClose} treeId={treeId} />
      <StyledRowContent
        className={dataTableStyle.cell}
        onClick={handleClickOpen}
        disabled={isDisabled}
      >
        <CellWrapper data-test-id="tree-name-cell">
          <TreeIcon className={dataTableStyle.icon} />
          {value}
          <StyledOpenInNewIcon disabled={isDisabled} />
          <PhyloTreeStatusTag treeStatus={status} />
        </CellWrapper>
      </StyledRowContent>
    </>
  );
};

export default TreeTableNameCell;
