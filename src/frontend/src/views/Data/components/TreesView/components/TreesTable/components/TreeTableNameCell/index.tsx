import { useTreatments } from "@splitsoftware/splitio-react";
import { Icon, Tooltip, TooltipTable } from "czifui";
import { SyntheticEvent, useState } from "react";
import {
  AnalyticsTreeDetailsView,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { TREE_STATUS } from "src/common/constants/types";
import { useGroupInfo } from "src/common/queries/groups";
import {
  foldInLocationName,
  useNamedLocationsById,
} from "src/common/queries/locations";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import NextstrainConfirmationModal from "src/views/Data/components/TreesView/components/TreesTable/components/TreeActionMenu/components/OpenInNextstrainButton/components/NextstrainConfirmationModal";
import { NO_CONTENT_FALLBACK } from "src/views/Upload/components/common/constants";
import { PhyloTreeStatusTag } from "./components/PhyloTreeStatusTag";
import {
  CellWrapper,
  popperPropsSx,
  StyledDetailsTooltipTarget,
  StyledInfoIconWrapper,
  StyledNameWrapper,
  StyledRowContent,
  StyledTooltip,
  StyledTreeCreator,
  StyledTreeIconWrapper,
} from "./style";

// TODO-TR: remove `value` and rename `item` after table refactor
interface Props {
  value?: string;
  item: PhyloRun;
}

const getDateRangeString = (item: PhyloRun): string => {
  // NOTE: The start date default is covid-specific. We will need to update for
  // other pathogens
  // Unless otherwise specified, we use all Covid samples. The first covid sample
  // that we have is from 2019-12-23.
  const startDate = item.templateArgs?.filterStartDate || "2019-12-23";
  // If no end date is specified, the last day is the day the tree was created
  const endDate =
    item.templateArgs?.filterEndDate || item.startedDate.slice(0, 10);

  return `${startDate} to ${endDate}`;
};

const TreeTableNameCell = ({ item }: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const { name, phyloTree, status, user } = item;
  const treeId = phyloTree?.id;
  const userName = user?.name;
  const isDisabled = status !== TREE_STATUS.Completed || !treeId;
  const { data: namedLocationsById } = useNamedLocationsById();

  const { data: groupInfo } = useGroupInfo();

  const tableRefactorFlag = useTreatments([USER_FEATURE_FLAGS.table_refactor]);
  const usesTableRefactor = isUserFlagOn(
    tableRefactorFlag,
    USER_FEATURE_FLAGS.table_refactor
  );

  const getLocationName = () => {
    const templateLocationId = item.templateArgs?.locationId;
    // If there is no locationId in templateArgs, either this is an old
    // tree or it was created with the default (group) location. If the
    // tree was created with the default location, we don't need to wait
    // for the namedLocations to return. However, if the groupInfo hasn't
    // come back yet, the location will be an empty string.
    if (!templateLocationId || templateLocationId === groupInfo?.location.id)
      return groupInfo?.location
        ? foldInLocationName(groupInfo?.location).name
        : "";
    // namedLocationsData takes a while to load. We do not want to show
    // the group location here because it is incorrect. Instead, we show
    // nothing until the data is ready.
    if (!namedLocationsById) return "";
    return namedLocationsById.namedLocationsById[templateLocationId].name;
  };

  const handleClickOpen = () => {
    if (!isDisabled) setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // no user name associated with phylotree/run means it was autogenerated
  const isAutoGenerated = Boolean(!userName);
  const displayName = isAutoGenerated ? "Weekly Auto-Build" : userName;

  const onDetailsOpen = (event: SyntheticEvent<Element, Event>) => {
    event.stopPropagation();
    analyticsTrackEvent<AnalyticsTreeDetailsView>(
      EVENT_TYPES.TREE_DETAILS_VIEW,
      {
        tree_id: treeId || null,
      }
    );
  };

  const filterDetails = [
    {
      label: "Location",
      value: getLocationName(),
    },
    { label: "Date Range", value: getDateRangeString(item) },
    {
      label: "Lineages",
      value: item.templateArgs?.filterPangoLineages?.join(", ") || "All",
    },
  ];

  const detailsData = [
    {
      dataRows: filterDetails,
    },
  ];

  return (
    <>
      {treeId && (
        <NextstrainConfirmationModal
          open={open}
          onClose={handleClose}
          treeId={treeId}
        />
      )}
      <StyledRowContent
        onClick={handleClickOpen}
        disabled={isDisabled}
        usesTableRefactor={usesTableRefactor}
      >
        <CellWrapper data-test-id="tree-name-cell">
          <StyledTreeIconWrapper>
            <Icon sdsIcon="treeHorizontal" sdsSize="xl" sdsType="static" />
          </StyledTreeIconWrapper>
          <StyledNameWrapper>
            <span data-test-id="tree-status">
              {name || NO_CONTENT_FALLBACK} <PhyloTreeStatusTag treeStatus={status} />
            </span>
            <StyledTreeCreator data-test-id="tree-creator-name">
              <Tooltip
                placement="bottom-start"
                title={<TooltipTable data={detailsData} itemAlign="left" />}
                onOpen={onDetailsOpen}
                PopperProps={popperPropsSx}
              >
                <StyledDetailsTooltipTarget>Details</StyledDetailsTooltipTarget>
              </Tooltip>
              &nbsp;|&nbsp;
              {displayName}
              {isAutoGenerated && (
                <StyledTooltip
                  arrow
                  leaveDelay={200}
                  title="This tree is automatically built by CZ GEN EPI every Monday"
                  placement="bottom"
                >
                  <StyledInfoIconWrapper>
                    <Icon
                      sdsIcon="infoCircle"
                      sdsSize="xs"
                      sdsType="interactive"
                    />
                  </StyledInfoIconWrapper>
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
