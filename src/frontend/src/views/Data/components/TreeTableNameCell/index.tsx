import { Icon } from "czifui";
import React, { useState } from "react";
import { StyledTooltip } from "src/common/components/library/data_subview/components/CreateNSTreeModal/style";
import { TREE_STATUS } from "src/common/constants/types";
import {
  InfoIconWrapper,
  StyledTreeIconWrapper,
} from "src/common/styles/iconStyle";
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
  item: PhyloRun;
}

const TreeTableNameCell = ({ value, item }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { phyloTree, status, user } = item;
  const treeId = phyloTree?.id;
  const userName = user?.name;
  const isDisabled = status !== TREE_STATUS.Completed || !treeId;

  const handleClickOpen = () => {
    if (!isDisabled) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // no user name associated with phylotree/run means it was autogenerated
  const isAutoGenerated = Boolean(!userName);
  const displayName = isAutoGenerated ? "Weekly Auto-Build" : userName;

  return (
    <>
      {treeId && (
        <NextstrainConfirmationModal
          open={open}
          onClose={handleClose}
          treeId={treeId}
        />
      )}
      <StyledRowContent onClick={handleClickOpen} disabled={isDisabled}>
        <CellWrapper data-test-id="tree-name-cell">
          <StyledTreeIconWrapper>
            <Icon sdsIcon="treeHorizontal" sdsSize="xl" sdsType="static" />
          </StyledTreeIconWrapper>
          <StyledNameWrapper>
            <span>
              {value} <PhyloTreeStatusTag treeStatus={status} />
            </span>
            <StyledTreeCreator>
              {displayName}
              {isAutoGenerated && (
                <StyledTooltip
                  arrow
                  leaveDelay={200}
                  title="This tree is automatically built by CZ GEN EPI every Monday"
                  placement="bottom"
                >
                  <InfoIconWrapper>
                    <Icon
                      sdsIcon="infoCircle"
                      sdsSize="xs"
                      sdsType="interactive"
                    />
                  </InfoIconWrapper>
                </StyledTooltip>
              )}
            </StyledTreeCreator>
          </StyledNameWrapper>
        </CellWrapper>
      </StyledRowContent>
    </>
  );
};

export default TreeTableNameCell;
