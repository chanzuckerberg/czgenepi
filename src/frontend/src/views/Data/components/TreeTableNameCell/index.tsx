import React, { useState } from "react";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { ReactComponent as TreeIcon } from "src/common/icons/PhyloTree.svg";
import { createTreeModalInfo } from "src/common/utils";
import TreeVizModal from "../TreeVizModal";
import { CellWrapper, StyledExternalLinkIcon, StyledRowContent } from "./style";

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

  const treeId = item.id;

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
        <CellWrapper>
          <TreeIcon className={dataTableStyle.icon} />
          {value}
          <StyledExternalLinkIcon />
        </CellWrapper>
      </StyledRowContent>
    </>
  );
};

export default TreeTableNameCell;
