import RadioGroup from "@mui/material/RadioGroup";
import { Icon, Link } from "czifui";
import { uniq } from "lodash";
import { SyntheticEvent, useEffect, useMemo, useState } from "react";
import {
  AnalyticsTreeCreationNextstrain,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import type { TreeType } from "src/common/constants/types";
import { TreeTypes } from "src/common/constants/types";
import { useGroupInfo } from "src/common/queries/groups";
import { useLineages } from "src/common/queries/lineages";
import {
  locationDepthPathogenConfig,
  useNamedPathogenDepthLocations,
  USE_LOCATIONS_INFO_QUERY_KEY,
  USE_PATHOGEN_DEPTH_LOCATIONS_INFO_QUERY_KEY,
} from "src/common/queries/locations";
import { RawTreeCreationWithId, useCreateTree } from "src/common/queries/trees";
import { addNotification } from "src/common/redux/actions";
import { useDispatch, useSelector } from "src/common/redux/hooks";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { getLocationFromGroup } from "src/common/utils/groupUtils";
import { createMaxDepthLocationFinder } from "src/common/utils/locationUtils";
import { pluralize } from "src/common/utils/strUtils";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { TreeNameInput } from "src/components/TreeNameInput";
import { Header } from "../DownloadModal/style";
import { Acknowledgement } from "./components/Acknowledgement";
import { AcknowledgementFooter } from "./components/AcknowledgementFooter";
import { BadOrFailedQCSampleAlert } from "./components/BadQCSampleAlert";
import { CreateTreeButton } from "./components/CreateTreeButton";
import { MissingSampleAlert } from "./components/MissingSampleAlert";
import {
  RadioLabelNonContextualized,
  RadioLabelOverview,
  RadioLabelTargeted,
} from "./components/RadioLabel";
import { SampleIdInput } from "./components/SampleIdInput";
import {
  CreateTreeInfo,
  FieldTitle,
  Separator,
  StyledDialog,
  StyledDialogContent,
  StyledDialogTitle,
  StyledFooter,
  StyledFormControlLabel,
  StyledInfoIconWrapper,
  StyledRadio,
  StyledTooltip,
  Title,
  TreeNameInfoWrapper,
  TreeTypeSection,
  TreeTypeSubtext,
} from "./style";

export type ResetFiltersType = {
  isFilterEnabled: boolean;
  resetFilters: () => void;
};

interface Props {
  checkedSampleIds: string[];
  badOrFailedQCSampleIds: string[];
  open: boolean;
  onClose: () => void;
}

export const CreateNSTreeModal = ({
  checkedSampleIds,
  badOrFailedQCSampleIds,
  open,
  onClose,
}: Props): JSX.Element => {
  const pathogen = useSelector(selectCurrentPathogen);
  const [treeName, setTreeName] = useState<string>("");
  const [isInputInEditMode, setIsInputInEditMode] = useState<boolean>(false);
  const [shouldReset, setShouldReset] = useState<boolean>(false);
  const [treeType, setTreeType] = useState<TreeType | undefined>();
  const [missingInputSamples, setMissingInputSamples] = useState<string[]>([]);
  const [validatedInputSamples, setValidatedInputSamples] = useState<string[]>(
    []
  );

  const handleChangeTreeType = (e: React.ChangeEvent<HTMLInputElement>) => {
    resetFilters();
    setTreeType(e.target.value as TreeType);
  };

  // --- FILTERS ---
  // Keep track of whether any filters have changed, use to show reset button
  const [isFilterEnabled, setIsFilterEnabled] = useState<boolean>(false);

  // Certain tree types can filter based on lineages
  const { data: lineagesData } = useLineages();
  const availableLineages: string[] = lineagesData?.lineages || [];
  const [selectedLineages, setSelectedLineages] = useState<string[]>([]);

  // Filter based on location
  const { data: groupInfo } = useGroupInfo();

  /*  useNamedLocations vs useNamedPathogenDepthLocations

  useNamedLocations fetches all location data, down to the location level
  i.e. Los Angeles County

  useNamedPathogenDepthLocations fetches location data, down to the level
  specified in locationDepthPathogenConfig.
  For mpox, the depth is set as "division", so locations would only be
  as specific as the division-level.  i.e. California

  We have two different queries because some pathogens (mpox) only create trees 
  using division data rather than location-level data. Other parts of the app - 
  notably sample upload - still use the location-level data for mpox.
  
  When the app loads, we will fetch location-level data using the query key 
  USE_LOCATIONS_INFO_QUERY_KEY.  When the pathogen uses division-level
  locations for trees, we have a second fetch with a new query key,
  USE_PATHOGEN_DEPTH_LOCATIONS_INFO_QUERY_KEY.
  
  Choosing the query key based on the pathogen ensures that pathogens
  that use all of the locations for their trees, i.e. SC2, don't have to re-fetch
  everything when opening the NS Tree Modal. 
  Setting this inside of useNamedPathogetDepthLocations does not properly update 
  the query key when switching between pathogens, which is why it is here.
  */

  const { data: namedLocationsData } = useNamedPathogenDepthLocations(
    locationDepthPathogenConfig[pathogen] === null
      ? USE_LOCATIONS_INFO_QUERY_KEY
      : USE_PATHOGEN_DEPTH_LOCATIONS_INFO_QUERY_KEY
  );
  const namedLocations: NamedGisaidLocation[] = useMemo(() => {
    return namedLocationsData?.namedLocations ?? [];
  }, [namedLocationsData]);

  // If we have the group's location, use this as the default for the filter
  const [selectedLocation, setSelectedLocation] =
    useState<NamedGisaidLocation | null>(getLocationFromGroup(groupInfo));

  const locationMaxDepthFinder = useMemo(() => {
    return createMaxDepthLocationFinder(namedLocations);
  }, [namedLocations]);

  const setLocationToGroupDefault = () => {
    const locationDepth = locationDepthPathogenConfig[pathogen];

    let defaultTreeLocation: NamedGisaidLocation | null | undefined = null;
    if (locationDepth === null) {
      // If locationDepth is not specified, use the group's location
      defaultTreeLocation = getLocationFromGroup(groupInfo);
    } else {
      // if the locationDepth is specified and location is defined, then search
      if (groupInfo?.location) {
        // Search for the location id that matches the max depth of the group's location
        // For example, for mpox the max depth is "division", we want to find the id of
        // the location that has the same division as the group's location, but location is null
        defaultTreeLocation = locationMaxDepthFinder(
          groupInfo.location,
          locationDepth
        );
      }
    }
    // If location is not defined, we can't set the default selectedLocation yet
    if (defaultTreeLocation) {
      setSelectedLocation(defaultTreeLocation);
    }
  };
  // If the group call isn't back when this is loaded, we need to update when the
  // call returns
  useEffect(setLocationToGroupDefault, [
    groupInfo,
    locationMaxDepthFinder,
    pathogen,
  ]);

  // Filter based on date ranges
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();

  const handleFilterChange = (onChangeFilter: () => void): void => {
    setIsFilterEnabled(true);
    onChangeFilter();
  };

  // Creating functions here rather than inline to avoid creating them
  // multiple times. Each function sets the isFilterEnabled flag and calls
  // the original useState set function.
  const handleSetSelectedLineages = (lineages: string[]): void =>
    handleFilterChange(() => setSelectedLineages(lineages));
  const handleSetSelectedLocation = (
    location: NamedGisaidLocation | null
  ): void => handleFilterChange(() => setSelectedLocation(location));
  const handleSetStartDate = (startDate: FormattedDateType): void =>
    handleFilterChange(() => setStartDate(startDate));
  const handleSetEndDate = (endDate: FormattedDateType): void =>
    handleFilterChange(() => setEndDate(endDate));

  // Reset filters
  const resetFilters = (): void => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedLineages([]);
    setLocationToGroupDefault();
    setIsFilterEnabled(false);
  };

  // --- ^ FILTERS ^ ---

  const dispatch = useDispatch();

  useEffect(() => {
    if (shouldReset) setShouldReset(false);
  }, [shouldReset]);

  const clearState = function () {
    setShouldReset(true);
    setTreeName("");
    setTreeType(undefined);
    setMissingInputSamples([]);
    setValidatedInputSamples([]);
    resetFilters();
  };

  const handleClose = function () {
    clearState();
    onClose();
  };

  const handleInputModeChange = (isEditing: boolean) => {
    setIsInputInEditMode(isEditing);
  };

  const handleInputValidation = (
    foundSamples: string[],
    missingSamples: string[]
  ) => {
    setValidatedInputSamples(foundSamples);
    setMissingInputSamples(missingSamples);
  };

  const treeNameLength = treeName.length;
  const hasValidName = treeNameLength > 0 && treeNameLength <= 128;

  const mutation = useCreateTree({
    componentOnError: () => {
      dispatch(
        addNotification({
          intent: "error",
          componentKey: NotificationComponents.CREATE_NS_TREE_FAILURE,
          shouldShowCloseButton: true,
        })
      );
      handleClose();
    },
    componentOnSuccess: (respData: RawTreeCreationWithId) => {
      analyticsTrackEvent<AnalyticsTreeCreationNextstrain>(
        EVENT_TYPES.TREE_CREATION_NEXTSTRAIN,
        {
          phylo_run_workflow_id: respData.id,
          // Safe to assert treeType is not undefined here, can't create tree
          // otherwise, it's just that checking happens in a child component.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          tree_type: treeType!,
          location_id: selectedLocation?.id || null,
          group_location_id: groupInfo?.location?.id || null,
          selected_lineages: JSON.stringify(selectedLineages),
          start_date: startDate || null,
          end_date: endDate || null,
          pathogen: pathogen,
        }
      );

      dispatch(
        addNotification({
          autoDismiss: 12000,
          intent: "info",
          componentKey: NotificationComponents.CREATE_NS_TREE_SUCCESS,
        })
      );

      handleClose();
    },
  });

  const TREE_TYPE_TOOLTIP_TEXT = (
    <div>
      Select the Tree Type best suited for the question you are trying to
      answer.{" "}
      <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6707491998996-Understand-phylogenetic-tree-types">
        Read our guide to learn more.
      </NewTabLink>
    </div>
  );

  const HEADER_TOOLTIP_TEXT = (
    <div>
      Visit our help center to{" "}
      <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees">
        learn more about building Nextstrain trees in CZ GEN EPI.
      </NewTabLink>
    </div>
  );

  const allPossibleTreeSamples = checkedSampleIds.concat(validatedInputSamples);
  const allValidSamplesForTreeCreation = allPossibleTreeSamples.filter(
    (id) => !missingInputSamples.includes(id)
  );

  const allSamplesRequestedTableAndInput = uniq(
    allPossibleTreeSamples.concat(missingInputSamples)
  );

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();

    mutation.mutate({
      sampleIds: allValidSamplesForTreeCreation,
      treeName,
      treeType,
      filters: {
        startDate,
        endDate,
        lineages: selectedLineages,
        location: selectedLocation || undefined,
      },
    });
  };

  return (
    <>
      <StyledDialog
        disableEscapeKeyDown
        disableBackdropClick
        disableEnforceFocus
        open={open}
        fullWidth={true}
        maxWidth={"sm"}
        onClose={handleClose}
        data-test-id="create-tree-dialog"
        scroll="body"
      >
        <StyledDialogTitle>
          <StyledCloseIconButton
            aria-label="close modal"
            onClick={handleClose}
            data-test-id="close-create-tree-dialog"
          >
            <StyledCloseIconWrapper>
              <Icon sdsIcon="xMark" sdsSize="l" sdsType="static" />
            </StyledCloseIconWrapper>
          </StyledCloseIconButton>
          <Header>
            Create New Phylogenetic Tree
            <StyledTooltip
              arrow
              leaveDelay={1000}
              title={HEADER_TOOLTIP_TEXT}
              placement="top"
              data-test-id="header-tooltip"
            >
              <StyledInfoIconWrapper>
                <Icon sdsIcon="infoCircle" sdsSize="s" sdsType="interactive" />
              </StyledInfoIconWrapper>
            </StyledTooltip>
          </Header>
          <Title data-test-id="title-with-sample-total">
            {allSamplesRequestedTableAndInput.length}{" "}
            {pluralize("Sample", allValidSamplesForTreeCreation.length)} Total
          </Title>
        </StyledDialogTitle>
        <StyledDialogContent data-test-id="modal-content">
          <Acknowledgement />
          <Separator marginSize="xl" />
          <TreeNameInput
            setTreeName={setTreeName}
            treeName={treeName}
            instructionHeader="Tree Name: "
            data-test-id="tree-name"
          />
          <TreeTypeSection>
            <TreeNameInfoWrapper>
              <FieldTitle>Tree Type: </FieldTitle>
              <StyledTooltip
                arrow
                leaveDelay={1000}
                title={TREE_TYPE_TOOLTIP_TEXT}
                placement="top"
                data-test-id="tree-type-tooltip"
              >
                <StyledInfoIconWrapper>
                  <Icon
                    sdsIcon="infoCircle"
                    sdsSize="xs"
                    sdsType="interactive"
                  />
                </StyledInfoIconWrapper>
              </StyledTooltip>
            </TreeNameInfoWrapper>
            <TreeTypeSubtext>
              Samples already selected on the sample table or included by ID in
              the bottom section will always be force-included on your tree.{" "}
              <Link
                href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees#generating"
                target="_blank"
              >
                Learn More.
              </Link>
            </TreeTypeSubtext>
            <RadioGroup value={treeType} onChange={handleChangeTreeType}>
              <StyledFormControlLabel
                value={TreeTypes.Overview}
                checked={treeType === TreeTypes.Overview}
                control={<StyledRadio />}
                label={
                  <RadioLabelOverview
                    selected={treeType === TreeTypes.Overview}
                    availableLineages={availableLineages}
                    selectedLineages={selectedLineages}
                    setSelectedLineages={handleSetSelectedLineages}
                    namedLocations={namedLocations}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={handleSetSelectedLocation}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={handleSetStartDate}
                    setEndDate={handleSetEndDate}
                    isFilterEnabled={isFilterEnabled}
                    resetFilters={resetFilters}
                  />
                }
              />
              <StyledFormControlLabel
                value={TreeTypes.Targeted}
                checked={treeType === TreeTypes.Targeted}
                control={<StyledRadio />}
                label={
                  <RadioLabelTargeted
                    selected={treeType === TreeTypes.Targeted}
                    namedLocations={namedLocations}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={handleSetSelectedLocation}
                    isFilterEnabled={isFilterEnabled}
                    resetFilters={resetFilters}
                  />
                }
              />
              <StyledFormControlLabel
                value={TreeTypes.NonContextualized}
                checked={treeType === TreeTypes.NonContextualized}
                control={<StyledRadio />}
                label={
                  <RadioLabelNonContextualized
                    selected={treeType === TreeTypes.NonContextualized}
                    availableLineages={availableLineages}
                    selectedLineages={selectedLineages}
                    setSelectedLineages={handleSetSelectedLineages}
                    namedLocations={namedLocations}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={handleSetSelectedLocation}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={handleSetStartDate}
                    setEndDate={handleSetEndDate}
                    isFilterEnabled={isFilterEnabled}
                    resetFilters={resetFilters}
                  />
                }
              />
            </RadioGroup>
          </TreeTypeSection>
          <Separator marginSize="l" />
          <SampleIdInput
            handleInputModeChange={handleInputModeChange}
            handleInputValidation={handleInputValidation}
            shouldReset={shouldReset}
          />
          <MissingSampleAlert missingSamples={missingInputSamples} />
          <BadOrFailedQCSampleAlert
            numBadOrFailedQCSamples={badOrFailedQCSampleIds?.length}
          />
        </StyledDialogContent>
        <StyledFooter>
          <CreateTreeButton
            hasValidName={hasValidName}
            hasSamples={allValidSamplesForTreeCreation.length > 0}
            isInEditMode={isInputInEditMode}
            treeType={treeType}
            onClick={handleSubmit}
          />
          <CreateTreeInfo>
            Creating a new tree can take up to 12 hours.
          </CreateTreeInfo>
          <AcknowledgementFooter />
        </StyledFooter>
      </StyledDialog>
    </>
  );
};
