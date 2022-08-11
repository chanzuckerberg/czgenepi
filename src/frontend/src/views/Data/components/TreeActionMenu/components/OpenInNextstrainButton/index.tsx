import { ButtonIcon, Icon, Tooltip } from "czifui";
import React, { useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import NextstrainConfirmationModal from "../../../NextstrainConfirmationModal";

interface Props {
  item: PhyloRun;
}

const OpenInNextstrainButton = ({ item }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { status, phyloTree } = item;
  const treeId = phyloTree?.id;
  const isDisabled = status !== TREE_STATUS.Completed || !treeId;

  const handleClickOpen = () => {
    if (!isDisabled) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={
          isDisabled
            ? "“View in Nextstrain” is only available for completed trees."
            : "View in Nextstrain"
        }
        placement="top"
      >
        <span>
          <ButtonIcon
            aria-label="view in Nextstrain"
            disabled={isDisabled}
            onClick={handleClickOpen}
            sdsSize="small"
            sdsType="primary"
            size="large"
          >
            <Icon sdsIcon="open" sdsSize="s" sdsType="iconButton" />
          </ButtonIcon>
        </span>
      </Tooltip>
      {treeId && (
        <NextstrainConfirmationModal
          open={open}
          onClose={handleClose}
          treeId={treeId as number}
        />
      )}
    </>
  );
};

export { OpenInNextstrainButton };
