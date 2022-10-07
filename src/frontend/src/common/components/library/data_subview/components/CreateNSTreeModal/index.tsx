import RadioGroup from "@mui/material/RadioGroup";
import { useTreatments } from "@splitsoftware/splitio-react";
import { Icon, Link } from "czifui";
import { uniq } from "lodash";
import Image from "next/image";
import { SyntheticEvent, useEffect, useState } from "react";
import {
  AnalyticsTreeCreationNextstrain,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import type { TreeType } from "src/common/constants/types";
import { TreeTypes } from "src/common/constants/types";
import GisaidLogo from "src/common/images/gisaid-logo-full.png";
import { useGroupInfo } from "src/common/queries/groups";
import { useLineages } from "src/common/queries/lineages";
import {
  foldInLocationName,
  useNamedLocations,
} from "src/common/queries/locations";
import { RawTreeCreationWithId, useCreateTree } from "src/common/queries/trees";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { TreeNameInput } from "src/components/TreeNameInput";
import { Header } from "../DownloadModal/style";
import { FailedSampleAlert } from "../FailedSampleAlert";
import { CreateTreeButton } from "./components/CreateTreeButton";
import { MissingSampleAlert } from "./components/MissingSampleAlert";
import {
  RadioLabelNonContextualized,
  RadioLabelOverview,
  RadioLabelTargeted,
} from "./components/RadioLabel";
import { SampleIdInput } from "./components/SampleIdInput";
import {
  Acknowledgements,
  Attribution,
  CreateTreeInfo,
  FieldTitle,
  ImageSizer,
  NextstrainLogo,
  Separator,
  SpacedAcknowledgements,
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
  failedSampleIds: string[];
  open: boolean;
  onClose: () => void;
}

export const CreateNSTreeModal = ({
  checkedSampleIds,
  failedSampleIds,
  open,
  onClose,
}: Props): JSX.Element => {
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
  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations: NamedGisaidLocation[] =
    namedLocationsData?.namedLocations ?? [];

  // If we have the group's location, use this as the default for the filter
  const [selectedLocation, setSelectedLocation] =
    useState<NamedGisaidLocation | null>(
      groupInfo?.location ? foldInLocationName(groupInfo?.location) : null
    );

  // If the group call isn't back when this is loaded, we need to update when the
  // call returns
  useEffect(() => {
    setSelectedLocation(
      groupInfo?.location ? foldInLocationName(groupInfo?.location) : null
    );
  }, [groupInfo?.location]);

  // Filter based on date ranges
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();

  const flag = useTreatments([USER_FEATURE_FLAGS.tree_location_filter]);
  const isTreeLocationFilterFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.tree_location_filter
  );

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
    setSelectedLocation(
      groupInfo?.location ? foldInLocationName(groupInfo?.location) : null
    );
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

  const allPossibleTreeSamples = checkedSampleIds.concat(validatedInputSamples);
  const allFailedOrMissingSamples = failedSampleIds.concat(missingInputSamples);
  const allValidSamplesForTreeCreation = allPossibleTreeSamples.filter(
    (id) => !allFailedOrMissingSamples.includes(id)
  );

  const allSamplesRequestedTableAndInput = uniq(
    allPossibleTreeSamples.concat(allFailedOrMissingSamples)
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
          <Header>Create New Phylogenetic Tree</Header>
          <Title data-test-id="title-with-sample-total">
            {allSamplesRequestedTableAndInput.length}{" "}
            {pluralize("Sample", allValidSamplesForTreeCreation.length)} Total
          </Title>
        </StyledDialogTitle>
        <StyledDialogContent data-test-id="modal-content">
          <Attribution>
            Built in partnership with <NextstrainLogo />, enabled by data
            from&nbsp;
            <Link href="https://gisaid.org/" target="_blank">
              <ImageSizer>
                <Image src={GisaidLogo} alt="GISAID" />
              </ImageSizer>
            </Link>
            .
          </Attribution>
          <SpacedAcknowledgements>
            We are grateful to the data contributors who shared the data used in
            this Web Application via the GISAID Initiative&#42;: the Authors,
            the Originating Laboratories responsible for obtaining the
            specimens, and the Submitting Laboratories that generated the
            genetic sequences and metadata.
          </SpacedAcknowledgements>
          <Acknowledgements>
            Data used in this web application remain subject to GISAID’s Terms
            and Conditions&nbsp;
            <Link href="http://www.gisaid.org/DAA/" target="_blank">
              http://www.gisaid.org/DAA/
            </Link>
            .
          </Acknowledgements>
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
            {isTreeLocationFilterFlagOn && (
              <TreeTypeSubtext>
                Samples already selected on the sample table or included by ID
                in the bottom section will always be force-included on your
                tree.{" "}
                <Link
                  href="https://help.czgenepi.org/hc/en-us/articles/6712563575956-Build-on-demand-trees#generating"
                  target="_blank"
                >
                  Learn More.
                </Link>
              </TreeTypeSubtext>
            )}
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
          <FailedSampleAlert numFailedSamples={failedSampleIds?.length} />
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
          <Separator marginSize="xl" marginBottomSize="l" />
          <Acknowledgements>
            Shu, Y., McCauley, J. (2017) GISAID: From vision to reality.
            EuroSurveillance, 22(13) DOI: 10.2807/1560-7917.ES.2017.22.13.30494.
          </Acknowledgements>
        </StyledFooter>
      </StyledDialog>
    </>
  );
};
