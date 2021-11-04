import { Dialog } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { useCreateTree } from "src/common/queries/trees";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { pluralize } from "src/common/utils/strUtils";
import { Header, StyledIconButton } from "../DownloadModal/style";
import { FailedSampleAlert } from "../FailedSampleAlert";
import { CreateTreeButton } from "./components/CreateTreeButton";
import { StyledButton } from "./components/CreateTreeButton/style";
import {
  RadioLabelNonContextualized,
  RadioLabelTargeted,
} from "./components/RadioLabel";
import { SampleIdInput } from "./components/SampleIdInput";
import { TreeNameInput } from "./components/TreeNameInput";
import {
  Content,
  CreateTreeInfo,
  FieldTitle,
  Separator,
  StyledDialogContent,
  StyledDialogTitle,
  StyledFormControlLabel,
  StyledInfoOutlinedIcon,
  StyledRadio,
  StyledTooltip,
  Title,
  TreeNameInfoWrapper,
  TreeTypeSection,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: string[];
  open: boolean;
  onClose: () => void;
  handleCreateTreeFailed: () => void;
  handleSetCreateTreeStarted: () => void;
}

const TreeTypes = {
  Targeted: "TARGETED",
  NonContextualized: "NON_CONTEXTUALIZED",
};
type TreeType = typeof TreeTypes[keyof typeof TreeTypes];

export const CreateNSTreeModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
  handleCreateTreeFailed,
  handleSetCreateTreeStarted,
}: Props): JSX.Element => {
  const [treeName, setTreeName] = useState<string>("");
  const [isTreeBuildDisabled, setTreeBuildDisabled] = useState<boolean>(false);
  const [shouldReset, setShouldReset] = useState<boolean>(false);
  const [treeType, setTreeType] = useState<TreeType>(TreeTypes.Targeted);
  const [missingInputSamples, setMissingInputSamples] = useState<string[]>([]);
  const [validatedInputSamples, setValidatedInputSamples] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (shouldReset) setShouldReset(false);
  }, [shouldReset]);

  const clearState = function () {
    setShouldReset(true);
    setTreeName("");
    setTreeType(TreeTypes.Targeted);
  };

  const handleClose = function () {
    clearState();
    onClose();
  };

  const handleInputValidation = (
    foundSamples: string[],
    missingSamples: string[]
  ) => {
    setValidatedInputSamples(foundSamples);
    setMissingInputSamples(missingSamples);
  };

  useEffect(() => {
    // TODO (mlila): remove with gisaidIngest feature (handled in CreateTreeButtom component)
    const treeNameLength = treeName.length;
    if (treeNameLength > 128 || treeNameLength === 0) {
      setTreeBuildDisabled(true);
    } else {
      if (
        treeType === TreeTypes.Targeted ||
        treeType === TreeTypes.NonContextualized
      ) {
        setTreeBuildDisabled(false);
      } else {
        setTreeBuildDisabled(true);
      }
    }
  }, [treeName, treeType]);

  const treeNameLength = treeName.length;
  const hasValidName = treeNameLength > 0 && treeNameLength <= 128;

  const mutation = useCreateTree({
    onError: () => {
      handleCreateTreeFailed();
      handleClose();
    },
    onSuccess: () => {
      handleSetCreateTreeStarted();
      handleClose();
    },
  });

  const TREE_TYPE_TOOLTIP_TEXT = (
    <div>
      Select the Tree Type best suited for the question you are trying to anwer.{" "}
      <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit">
        Read our guide to learn more.
      </NewTabLink>
    </div>
  );

  const allPossibleSamples = sampleIds.concat(validatedInputSamples);
  const allFailedOrMissingSamples = failedSamples.concat(missingInputSamples);
  const allValidSamplesForTreeCreation = allPossibleSamples.filter(
    (id) => !allFailedOrMissingSamples.includes(id)
  );

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    mutation.mutate({
      sampleIds: allValidSamplesForTreeCreation,
      treeName,
      treeType,
    });
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={handleClose}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <StyledDialogTitle>
        <StyledIconButton onClick={handleClose}>
          <CloseIcon />
        </StyledIconButton>
        <Header>Create New Phylogenetic Tree</Header>
        <Title>
          {allValidSamplesForTreeCreation.length}{" "}
          {pluralize("Sample", allValidSamplesForTreeCreation.length)} Total
        </Title>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Content data-test-id="modal-content">
          <form onSubmit={handleSubmit}>
            <TreeNameInput setTreeName={setTreeName} treeName={treeName} />
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
                    />
                  }
                />
              </RadioGroup>
            </TreeTypeSection>
            {usesFeatureFlag(FEATURE_FLAGS.gisaidIngest) && (
              <>
                <Separator marginSize="l" />
                <SampleIdInput handleInputValidation={handleInputValidation} />
                <Separator marginSize="xl" />
              </>
            )}
            <FailedSampleAlert
              numFailedSamples={allFailedOrMissingSamples?.length}
            />
            {usesFeatureFlag(FEATURE_FLAGS.gisaidIngest) && (
              // TODO (mlila): ensure all of these props are accurate (state managed from input)
              <CreateTreeButton
                hasValidName={hasValidName}
                hasSamples={allValidSamplesForTreeCreation.length > 0}
                isInEditMode={false}
                isValidTreeType={Object.values(TreeTypes).includes(treeType)}
              />
            )}
            {!usesFeatureFlag(FEATURE_FLAGS.gisaidIngest) && (
              <StyledButton
                color="primary"
                variant="contained"
                isRounded
                disabled={isTreeBuildDisabled}
                type="submit"
                value="Submit"
              >
                Create Tree
              </StyledButton>
            )}
          </form>
          <CreateTreeInfo>
            Creating a new tree can take up to 12 hours.
          </CreateTreeInfo>
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
