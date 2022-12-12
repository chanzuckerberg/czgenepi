import { useEffect, useState } from "react";
import { EVENT_TYPES } from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { ROUTES } from "src/common/routes";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { UsherConfirmationModal } from "./components/UsherConfirmationModal";
import { UsherPlacementModal } from "./components/UsherPlacementModal";

interface Props {
  checkedSampleIds: string[];
  failedSampleIds: string[];
  badQCSampleIds: string[];
  shouldStartUsherFlow: boolean;
}

const USHER_DBS: PathogenConfigType<string> = {
  [Pathogen.COVID]: "wuhCor1",
  [Pathogen.MONKEY_POX]: "hub_3471181_GCF_014621545.1",
};

const generateUsherLink = (
  remoteFile: string,
  treeType: string,
  sampleCount: number,
  pathogen: Pathogen
) => {
  const encodedFileLink = encodeURIComponent(remoteFile);

  const DB_PARAM = `db=${USHER_DBS[pathogen]}`;
  const FILE_PARAM = `remoteFile=${encodedFileLink}`;
  const TREE_TYPE_PARAM = `phyloPlaceTree=${treeType}`;
  const SAMPLE_COUNT_PARAM = `subtreeSize=${sampleCount}`;

  const queryParams = [
    DB_PARAM,
    FILE_PARAM,
    TREE_TYPE_PARAM,
    SAMPLE_COUNT_PARAM,
  ].join("&");

  return `${ROUTES.USHER}?${queryParams}`;
};

const UsherTreeFlow = ({
  checkedSampleIds,
  failedSampleIds,
  badQCSampleIds,
  shouldStartUsherFlow,
}: Props): JSX.Element => {
  const dispatch = useDispatch();

  const [isPlacementOpen, setIsPlacementOpen] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [usherLink, setUsherLink] = useState<string>("");

  useEffect(() => {
    if (shouldStartUsherFlow) setIsPlacementOpen(true);
  }, [shouldStartUsherFlow]);

  const openUsher = () => {
    if (!usherLink) return;

    const link = document.createElement("a");
    link.href = usherLink;
    link.target = "_blank";
    link.rel = "noopener";
    link.click();
    link.remove();
  };

  const onLinkCreateSuccess = (
    url: string,
    treeType: string,
    sampleCount: number,
    pathogen: Pathogen
  ) => {
    const usherLink = generateUsherLink(url, treeType, sampleCount, pathogen);
    setUsherLink(usherLink);
    setIsConfirmOpen(true);
  };

  const handleConfirmationClose = () => {
    setIsPlacementOpen(false);
    setIsConfirmOpen(false);
    setUsherLink("");
  };

  const handleConfirmationConfirm = () => {
    openUsher();
    analyticsTrackEvent(EVENT_TYPES.TREE_CREATION_VIEW_USHER);
    setIsConfirmOpen(false);
    setIsPlacementOpen(false);

    dispatch(
      addNotification({
        buttonOnClick: () => setUsherLink(""),
        componentKey: NotificationComponents.USHER_PLACEMENT_SUCCESS,
        componentProps: {
          usherLink,
        },
        intent: "info",
        shouldShowCloseButton: true,
      })
    );
  };

  return (
    <>
      <UsherPlacementModal
        checkedSampleIds={checkedSampleIds}
        failedSampleIds={failedSampleIds}
        badQCSampleIds={badQCSampleIds}
        open={isPlacementOpen}
        onClose={() => setIsPlacementOpen(false)}
        onLinkCreateSuccess={onLinkCreateSuccess}
      />
      <UsherConfirmationModal
        isOpen={isConfirmOpen}
        onClose={handleConfirmationClose}
        onConfirm={handleConfirmationConfirm}
      />
    </>
  );
};

export { UsherTreeFlow };
