import { ButtonIcon, Icon, Tooltip } from "czifui";
import { useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import NextstrainConfirmationModal from "./components/NextstrainConfirmationModal";

interface Props {
  phyloRun: PhyloRun;
}

const OpenInNextstrainButton = ({ phyloRun }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { status, phyloTree } = phyloRun;
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
        role="none"
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={
          isDisabled
            ? "“View in Nextstrain” is only available for completed trees."
            : "View in Nextstrain"
        }
        placement="top"
        data-test-id="view-in-nextstrain"
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
            <Icon sdsIcon="treeHorizontal" sdsSize="s" sdsType="iconButton" />
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
