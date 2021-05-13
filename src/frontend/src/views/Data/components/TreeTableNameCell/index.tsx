import React, { useState } from "react";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { RowContent } from "src/common/components/library/data_table/style";
import { ReactComponent as ExternalLinkIcon } from "src/common/icons/ExternalLink.svg";
import { ReactComponent as TreeIcon } from "src/common/icons/PhyloTree.svg";
import { createTreeModalInfo } from "src/common/utils";
import TreeVizModal from "../TreeVizModal";

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
    <RowContent className={dataTableStyle.cell}>
      <TreeVizModal
        open={open}
        onClose={handleClose}
        info={createTreeModalInfo(treeId)}
      />
      <div onClick={handleClickOpen} className={dataTableStyle.modalTrigger}>
        <TreeIcon className={dataTableStyle.icon} />
        {value}
        <ExternalLinkIcon className={dataTableStyle.icon} />
      </div>
    </RowContent>
  );
};

export default TreeTableNameCell;
