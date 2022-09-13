import { ButtonIcon, Icon, Tooltip } from "czifui";
import { useState } from "react";
import { TREE_STATUS } from "src/common/constants/types";
import GalagoConfirmationModal from "src/views/Data/components/GalagoConfirmationModal";

interface Props {
  item: PhyloRun;
}

const OpenInGalagoButton = ({ item }: Props): JSX.Element => {
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
        role="none"
        arrow
        sdsStyle={isDisabled ? "light" : "dark"}
        title={
          isDisabled
            ? "“View in Galago” is only available for completed trees."
            : "View in Galago"
        }
        placement="top"
      >
        <span>
          <ButtonIcon
            aria-label="view in Galago"
            disabled={isDisabled}
            onClick={handleClickOpen}
            sdsSize="small"
            sdsType="primary"
            size="large"
          >
            <Icon sdsIcon="lightBulb" sdsSize="s" sdsType="iconButton" />
          </ButtonIcon>
        </span>
      </Tooltip>
      {treeId && (
        // TODO: (ehoops): replace this with the Galago modal as part of SC-214165
        <GalagoConfirmationModal
          open={open}
          onClose={handleClose}
          treeId={treeId as number}
        />
      )}
    </>
  );
};

export { OpenInGalagoButton };
