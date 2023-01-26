import { ButtonIcon, Icon, Tooltip } from "czifui";
import { useState } from "react";
import {
  AnalyticsTreeActionsClickGalago,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { TREE_STATUS } from "src/common/constants/types";
import { GalagoConfirmationModal } from "./components/GalagoConfirmationModal";

interface Props {
  phyloRun: PhyloRun;
}

const OpenInGalagoButton = ({ phyloRun }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { status, phyloTree } = phyloRun;
  const treeId = phyloTree?.id;
  const isDisabled = status !== TREE_STATUS.Completed || !treeId;

  const handleClickOpen = () => {
    if (!isDisabled) {
      analyticsTrackEvent<AnalyticsTreeActionsClickGalago>(
        EVENT_TYPES.TREE_ACTIONS_CLICK_GALAGO,
        {
          tree_id: treeId,
        }
      );
      setOpen(true);
    }
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
            ? `“Interpret in Galago” is only available for completed trees.`
            : "Interpret in Galago"
        }
        placement="top"
      >
        <span>
          <ButtonIcon
            aria-label="Interpret in Galago"
            disabled={isDisabled}
            onClick={handleClickOpen}
            sdsSize="small"
            sdsType="primary"
            size="large"
          >
            <Icon
              sdsIcon="barChartVertical3"
              sdsSize="s"
              sdsType="iconButton"
            />
          </ButtonIcon>
        </span>
      </Tooltip>
      {treeId && (
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
