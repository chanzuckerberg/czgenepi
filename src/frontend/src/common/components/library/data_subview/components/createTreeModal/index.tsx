import { Dialog } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import { Alert, Link } from "czifui";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { createTree } from "src/common/queries/trees";
import { Header, StyledIconButton } from "../DownloadModal/style";
import {
  RadioLabelNonContextualized,
  RadioLabelTargeted,
} from "./components/RadioLabel";
import {
  AlertInstructionsNotSemiBold,
  AlertInstructionsSemiBold,
  Content,
  CreateTreeInfo,
  FieldTitle,
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledButton,
  StyledDialogContent,
  StyledDialogTitle,
  StyledErrorOutlinedIcon,
  StyledFormControlLabel,
  StyledInfoOutlinedIcon,
  StyledInstructions,
  StyledInstructionsButton,
  StyledRadio,
  StyledTextField,
  StyledTooltip,
  StyledWarningIcon,
  TextFieldAlert,
  Title,
  TreeNameInfoWrapper,
  TreeNameSection,
  TreeNameTooLongAlert,
  TreeTypeSection,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: any[];
  open: boolean;
  onClose: () => void;
  handleCreateTreeFailed: () => void;
  handleSetCreateTreeStarted: () => void;
}

export const CreateTreeModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
  handleCreateTreeFailed,
  handleSetCreateTreeStarted,
}: Props): JSX.Element => {
  const [treeName, setTreeName] = useState<string>("");
  const [isTreeNameTooLong, setTreeNameTooLong] = useState<boolean>(false);
  const [isTreeBuildDisabled, setTreeBuildDisabled] = useState<boolean>(false);
  const [treeType, setTreeType] = useState<string>("TARGETED");
  const [areInstructionsShown, setInstructionsShown] = useState<boolean>(false);
  useState<boolean>(false);

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

  const mutation = useMutation(createTree, {
    onError: () => {
      setTreeName("");
      setTreeType("TARGETED");
      handleCreateTreeFailed();
      onClose();
    },
    onSuccess: () => {
      setTreeName("");
      setTreeType("TARGETED");
      onClose();
      handleSetCreateTreeStarted();
    },
  });

  const handleInstructionsClick = function () {
    setInstructionsShown((prevState: boolean) => !prevState);
  };

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    sampleIds = sampleIds.filter((id) => !failedSamples.includes(id));
    mutation.mutate({ sampleIds, treeName, treeType });
  };

  const TREE_TYPE_TOOLTIP_TEXT = (
    <div>
      Select the Tree Type best suited for the question you are trying to anwer.{" "}
      <Link
        href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit?usp=sharing]"
        target="_blank"
        rel="noopener"
      >
        Read our guide to learn more.
      </Link>
    </div>
  );

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <StyledDialogTitle>
        <StyledIconButton onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
        <Header>Create New Phylogenetic Tree</Header>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
        </Title>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Content data-test-id="modal-content">
          <form onSubmit={handleSubmit}>
            <TreeNameSection>
              <TreeNameInfoWrapper>
                <FieldTitle>Tree Name</FieldTitle>
                <StyledInstructionsButton
                  color="primary"
                  onClick={handleInstructionsClick}
                >
                  {areInstructionsShown ? "LESS" : "MORE"} INFO
                </StyledInstructionsButton>
              </TreeNameInfoWrapper>
              {areInstructionsShown && (
                <StyledInstructions
                  items={[
                    <InstructionsSemiBold key="1">
                      Do not include any PII in your Tree name.
                    </InstructionsSemiBold>,
                    <InstructionsNotSemiBold key="2">
                      Tree names must be no longer than 128 characters.
                    </InstructionsNotSemiBold>,
                  ]}
                />
              )}
              <StyledTextField
                fullWidth
                error={isTreeNameTooLong}
                id="outlined-basic"
                variant="outlined"
                value={treeName}
                size="small"
                onChange={(e) => setTreeName(e.target.value)}
              />
              {isTreeNameTooLong && (
                <TreeNameTooLongAlert>
                  <StyledErrorOutlinedIcon />
                  <TextFieldAlert>
                    Name exceeds the 128 character limit.
                  </TextFieldAlert>
                </TreeNameTooLongAlert>
              )}
            </TreeNameSection>
            <TreeTypeSection>
              <TreeNameInfoWrapper>
                <FieldTitle>Tree Type: </FieldTitle>
                <StyledTooltip
                  arrow
                  title={TREE_TYPE_TOOLTIP_TEXT}
                  placement="top"
                >
                  <StyledInfoOutlinedIcon />
                </StyledTooltip>
              </TreeNameInfoWrapper>
              <RadioGroup
                value={treeType}
                onChange={(e) => setTreeType(e.target.value)}
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
            {failedSamples.length > 0 && (
              <Alert icon={<StyledWarningIcon />} severity="warning">
                <AlertInstructionsSemiBold>
                  {" "}
                  {failedSamples.length} Selected Sample
                  {failedSamples.length > 1 && "s"} {"won't"} be included in
                  your tree{" "}
                </AlertInstructionsSemiBold>
                <AlertInstructionsNotSemiBold>
                  because they failed genome recovery.
                </AlertInstructionsNotSemiBold>
              </Alert>
            )}
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
          </form>
          <CreateTreeInfo>
            Creating a new tree can take up to 12 hours.
          </CreateTreeInfo>
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
