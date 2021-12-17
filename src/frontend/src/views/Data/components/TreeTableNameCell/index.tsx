import React, { useState } from "react";
import dataTableStyle from "src/common/components/library/data_table/index.module.scss";
import { TREE_STATUS } from "src/common/constants/types";
import TreeIcon from "src/common/icons/PhyloTree.svg";
import NextstrainConfirmationModal from "../NextstrainConfirmationModal";
import { PhyloTreeStatusTag } from "./components/PhyloTreeStatusTag";
import {
  CellWrapper,
  StyledNameWrapper,
  StyledRowContent,
  StyledTreeCreator,
} from "./style";

interface Props {
  value: string;
  item: Tree;
}

const TreeTableNameCell = ({ value, item }: Props): JSX.Element => {
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

  const { user } = item;
  // TODO (mlila): update name to include auto builds
  // TODO          this requires backend changes.
  // const displayName =
  //   user?.group === CZ_BIOHUB_GROUP ? "CZ Biohub" : user?.name;
  const displayName = user?.name;

  return (
    <>
      <NextstrainConfirmationModal
        open={open}
        onClose={handleClose}
        treeId={treeId}
      />
      <StyledRowContent
        className={dataTableStyle.cell}
        onClick={handleClickOpen}
        disabled={isDisabled}
      >
        <CellWrapper data-test-id="tree-name-cell">
          <TreeIcon className={dataTableStyle.icon} />
          <StyledNameWrapper>
            <span>{value}</span>
            <StyledTreeCreator>{displayName}</StyledTreeCreator>
          </StyledNameWrapper>
          <PhyloTreeStatusTag treeStatus={status} />
        </CellWrapper>
      </StyledRowContent>
    </>
  );
};

export default TreeTableNameCell;
