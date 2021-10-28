import { Dialog } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import { Tooltip } from "czifui";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { useCreateTree } from "src/common/queries/trees";
import { FEATURE_FLAGS, usesFeatureFlag } from "src/common/utils/featureFlags";
import { pluralize } from "src/common/utils/strUtils";
import { Header, StyledIconButton } from "../DownloadModal/style";
import { FailedSampleAlert } from "../FailedSampleAlert";
import {
  RadioLabelNonContextualized,
  RadioLabelTargeted,
} from "./components/RadioLabel";
import { TreeNameInput } from "./components/TreeNameInput";
import {
  Content,
  CreateTreeInfo,
  FieldTitle,
  Separator,
  StyledButton,
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

export type TreeType = "TARGETED" | "NON_CONTEXTUALIZED";

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
  const [treeType, setTreeType] = useState<TreeType>("TARGETED");
  // comment back in when ready to use validation endpoint
  // const [sampleIdsToValidate, setSampleIdsToValidate] = useState<string[]>([]);
  // const [missingSampleIdentifiers, setMissingSampleIdentifiers] = useState<string[]>([]);

  const clearState = function () {
    setTreeName("");
    setTreeType("TARGETED");
    setInstructionsShown(false);
    setTreeNameTooLong(false);
  };

  const handleClose = function () {
    clearState();
    onClose();
  };

  useEffect(() => {
    const treeNameLength = treeName.length;
    if (treeNameLength > 128) {
      setTreeNameTooLong(true);
      setTreeBuildDisabled(true);
    } else if (treeNameLength === 0) {
      setTreeBuildDisabled(true);
    } else {
      setTreeNameTooLong(false);
      if (treeType === "TARGETED" || treeType === "NON_CONTEXTUALIZED") {
        setTreeBuildDisabled(false);
      } else {
        setTreeBuildDisabled(true);
      }
    }
  }, [treeName, treeType]);

  // Comment below back in when ready to use validation endpoint
  // const validateSampleIdentifiersMutation = useMutation(
  //   validateSampleIdentifiers,
  //   {
  //     onError: () => {
  //       // placeholder
  //     },
  //     onSuccess: (data: any) => {
  //       // set samples identifiers that were not found in the aspen database as missing
  //       setMissingSampleIdentifiers(data["missing_sample_ids"]);
  //     },
  //   }
  // );

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

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    sampleIds = sampleIds.filter((id) => !failedSamples.includes(id));
    mutation.mutate({ sampleIds, treeName, treeType });
  };

  const TREE_TYPE_TOOLTIP_TEXT = (
    <div>
      Select the Tree Type best suited for the question you are trying to anwer.{" "}
      <NewTabLink href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit">
        Read our guide to learn more.
      </NewTabLink>
    </div>
  );

  const NO_NAME_NO_SAMPLES =
    "Your tree requires a Tree Name & at least 1 Sample or Sample ID.";

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
          {sampleIds.length} {pluralize("Sample", sampleIds.length)} Total
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
                  value="TARGETED"
                  checked={treeType === "TARGETED"}
                  control={<StyledRadio />}
                  label={
                    <RadioLabelTargeted selected={treeType === "TARGETED"} />
                  }
                />
                <StyledFormControlLabel
                  value="NON_CONTEXTUALIZED"
                  checked={treeType === "NON_CONTEXTUALIZED"}
                  control={<StyledRadio />}
                  label={
                    <RadioLabelNonContextualized
                      selected={treeType === "NON_CONTEXTUALIZED"}
                    />
                  }
                />
              </RadioGroup>
            </TreeTypeSection>
            <Separator size="l" />
            <FieldTitle>Add Samples by ID (optional)</FieldTitle>
            <Separator size="xl" />
            <FailedSampleAlert numFailedSamples={failedSamples?.length} />
            {usesFeatureFlag(FEATURE_FLAGS.gisaidIngest) && (
              <Tooltip
                arrow
                disableHoverListener={!isTreeBuildDisabled}
                sdsStyle="dark"
                title={NO_NAME_NO_SAMPLES}
              >
                <div>
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
                </div>
              </Tooltip>
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
          {/*
          Placeholder for when we add in actual id validation text box
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            onClick={() => {
              validateSampleIdentifiersMutation.mutate({ sampleIdsToValidate });
            }}
          >
            test validate validateSampleIdentifiers
          </StyledButton> */}
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
