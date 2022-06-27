import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import { uniq } from "lodash";
import Image from "next/image";
import NextLink from "next/link";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import type { TreeType } from "src/common/constants/types";
import { TreeTypes } from "src/common/constants/types";
import GisaidLogo from "src/common/images/gisaid-logo-full.png";
import { useLineages } from "src/common/queries/lineages";
import { useCreateTree } from "src/common/queries/trees";
import { ROUTES } from "src/common/routes";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import Notification from "src/components/Notification";
import { TreeNameInput } from "src/components/TreeNameInput";
import { ContactUsLink } from "../ContactUsLink";
import { Header, StyledIconButton } from "../DownloadModal/style";
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
  StyledButton,
  StyledDialog,
  StyledDialogContent,
  StyledDialogTitle,
  StyledFooter,
  StyledFormControlLabel,
  StyledInfoOutlinedIcon,
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
  const [shouldShowErrorNotification, setShouldShowErrorNotification] =
    useState<boolean>(false);
  const [
    shouldShowTreeCreatedNotification,
    setShouldShowTreeCreatedNotification,
  ] = useState<boolean>(false);
  const [validatedInputSamples, setValidatedInputSamples] = useState<string[]>(
    []
  );

  // Certain tree types can filter based on lineages and date ranges
  const { data: lineagesData } = useLineages();
  const availableLineages: string[] = lineagesData?.lineages || [];
  const [selectedLineages, setSelectedLineages] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();

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
      setShouldShowErrorNotification(true);
      handleClose();
    },
    componentOnSuccess: () => {
      setShouldShowTreeCreatedNotification(true);
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

  const handleDismissErrorNotification = () => {
    setShouldShowErrorNotification(false);
  };

  return (
    <>
      <Notification
        buttonOnClick={handleDismissErrorNotification}
        buttonText="DISMISS"
        dismissDirection="right"
        dismissed={!shouldShowErrorNotification}
        intent="error"
      >
        <B>Something went wrong and we were unable to start your tree build</B>{" "}
        <ContactUsLink />
      </Notification>
      <Notification
        autoDismiss={12000}
        dismissDirection="right"
        dismissed={!shouldShowTreeCreatedNotification}
        intent="info"
      >
        <span>
          Your tree is being created. It may take up to 12 hours to process. To
          check your tree’s status, visit the Phylogenetic Tree tab.
        </span>
        <NextLink href={ROUTES.PHYLO_TREES} passHref>
          <a href="passRef">
            <StyledButton
              sdsType="primary"
              sdsStyle="minimal"
              onClick={() => setShouldShowTreeCreatedNotification(false)}
            >
              VIEW MY TREES
            </StyledButton>
          </a>
        </NextLink>
      </Notification>
      <StyledDialog
        disableEscapeKeyDown
        disableBackdropClick
        disableEnforceFocus
        open={open}
        fullWidth={true}
        maxWidth={"sm"}
        onClose={handleClose}
      >
        <StyledDialogTitle>
          <StyledIconButton onClick={handleClose}>
            <CloseIcon />
          </StyledIconButton>
          <Header>Create New Phylogenetic Tree</Header>
          <Title>
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
          />
          <TreeTypeSection>
            <TreeNameInfoWrapper>
              <FieldTitle>Tree Type: </FieldTitle>
              <StyledTooltip
                arrow
                leaveDelay={1000}
                title={TREE_TYPE_TOOLTIP_TEXT}
                placement="top"
              >
                <StyledInfoOutlinedIcon />
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
