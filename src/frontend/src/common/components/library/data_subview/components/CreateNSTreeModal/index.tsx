import RadioGroup from "@mui/material/RadioGroup";
import { Icon } from "czifui";
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
import { useLineages } from "src/common/queries/lineages";
import { RawTreeCreationWithId, useCreateTree } from "src/common/queries/trees";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
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
  Attribution,
  CreateTreeInfo,
  FieldTitle,
  ImageSizer,
  NextstrainLogo,
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
} from "./style";

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

  // Certain tree types can filter based on lineages and date ranges
  const { data: lineagesData } = useLineages();
  const availableLineages: string[] = lineagesData?.lineages || [];
  const [selectedLineages, setSelectedLineages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();

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
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedLineages([]);
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
          tree_type: treeType!,
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
            <ImageSizer>
              <Image src={GisaidLogo} />
            </ImageSizer>
            .
          </Attribution>
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
            <RadioGroup
              value={treeType}
              onChange={(e) => setTreeType(e.target.value as TreeType)}
            >
              <StyledFormControlLabel
                value={TreeTypes.Overview}
                checked={treeType === TreeTypes.Overview}
                control={<StyledRadio />}
                label={
                  <RadioLabelOverview
                    selected={treeType === TreeTypes.Overview}
                    availableLineages={availableLineages}
                    selectedLineages={selectedLineages}
                    setSelectedLineages={setSelectedLineages}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
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
                    setSelectedLineages={setSelectedLineages}
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
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
          <Separator marginSize="xl" />
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
        </StyledFooter>
      </StyledDialog>
    </>
  );
};
