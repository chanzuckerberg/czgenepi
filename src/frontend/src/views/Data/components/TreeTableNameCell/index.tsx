import React, { useState } from "react";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import TreeIcon from "src/common/icons/PhyloTree.svg";
import { createTreeModalInfo } from "src/common/utils";
import TreeVizModal from "../TreeVizModal";
import { CellWrapper, StyledOpenInNewIcon, StyledRowContent } from "./style";

interface NameProps {
  value: string;
  item: Tree;
}

const TreeTableNameCell = ({ value, item }: NameProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // TODO: Create a pathway to handle Trees with no id, for trees
  // that are in progress or failed
  const treeId = item.id as number;

  return (
    <>
      <TreeVizModal
        open={open}
        onClose={handleClose}
        info={createTreeModalInfo(treeId)}
      />
      <StyledRowContent
        className={dataTableStyle.cell}
        onClick={handleClickOpen}
      >
        <CellWrapper data-test-id="tree-name-cell">
          <TreeIcon className={dataTableStyle.icon} />
          {value}
          <StyledOpenInNewIcon />
        </CellWrapper>
      </StyledRowContent>
    </>
  );
};

export default TreeTableNameCell;
