import { Dialog } from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import { Alert, Link } from "czifui";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { useMutation } from "react-query";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import { createTree } from "src/common/queries/trees";
import { Header, StyledIconButton } from "../DownloadModal/style";
import { RadioLabelContextual, RadioLabelLocal } from "./components/RadioLabel";
import {
  Content,
  CreateTreeInfo,
  FieldTitle,
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledButton,
  StyledDialogTitle,
  StyledErrorOutlinedIcon,
  StyledFormControlLabel,
  StyledInfoOutlinedIcon,
  StyledInstructions,
  StyledInstructionsButton,
  StyledRadio,
  StyledTextField,
  StyledTooltip,
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
  setCreateTreeFailed: (hasFailed: boolean) => void;
}

export const CreateTreeModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
  setCreateTreeFailed,
}: Props): JSX.Element => {
  const [treeName, setTreeName] = useState<string>("");
  const [isTreeNameTooLong, setTreeNameTooLong] = useState<boolean>(false);
  const [isTreeBuildDisabled, setTreeBuildDisabled] = useState<boolean>(false);
  const [treeType, setTreeType] = useState<string>("");
  const [isContextual, setContextual] = useState<boolean>(true);
  const [isLocal, setLocal] = useState<boolean>(false);
  const [areInstructionsShown, setInstructionsShown] = useState<boolean>(false);
  useState<boolean>(false);

  useEffect(() => {
    if (treeType === "contextual") {
      setLocal(false);
      setContextual(true);
    }
    if (treeType === "local") {
      setContextual(false);
      setLocal(true);
    }
  }, [treeType]);

  useEffect(() => {
    const treeNameLength = treeName.length;
    if (treeNameLength > 128) {
      setTreeNameTooLong(true);
      setTreeBuildDisabled(true);
    } else if (treeNameLength === 0) {
      setTreeBuildDisabled(true);
    } else {
      setTreeNameTooLong(false);
      if (isContextual || isLocal) {
        setTreeBuildDisabled(false);
      } else {
        setTreeBuildDisabled(true);
      }
    }
  }, [treeName, isContextual, isLocal]);

  const mutation = useMutation(createTree, {
    onError: () => {
      setCreateTreeFailed(true);
    },
    onSuccess: () => {
      setTreeName("");
      setTreeType("");
      onClose();
    },
  });

  const handleInstructionsClick = function () {
    setInstructionsShown((prevState: boolean) => !prevState);
  };

  const handleSubmit = (evt: SyntheticEvent) => {
    evt.preventDefault();
    mutation.mutate({ sampleIds, treeName, treeType });
  };

  const TREE_TYPE_TOOLTIP_TEXT = (
    <div>
      We add public samples, from GISAID, to your tree to provide important
      context for interpreting your results.{" "}
      <Link href="https://docs.google.com/document/d/1_iQgwl3hn_pjlZLX-n0alUbbhgSPZvpW_0620Hk_kB4/edit">
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
      <DialogContent>
        <Content data-test-id="modal-content">
          <form onSubmit={handleSubmit}>
            <TreeNameSection>
              <TreeNameInfoWrapper>
                <FieldTitle>Tree Name: </FieldTitle>
                <StyledInstructionsButton
                  color="primary"
                  onClick={handleInstructionsClick}
                >
                  {areInstructionsShown ? "LESS" : "MORE"} INFO
                </StyledInstructionsButton>
              </TreeNameInfoWrapper>
              {areInstructionsShown && (
                <StyledInstructions
                  title=""
                  items={[
                    <span key="1">
                      <InstructionsSemiBold>
                        Do not include any PII in your Tree name.
                      </InstructionsSemiBold>{" "}
                    </span>,
                    <span key="2">
                      <InstructionsNotSemiBold>
                        Tree names must be no longer than 128 characters.
                      </InstructionsNotSemiBold>
                    </span>,
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
                <FieldTitle>
                  Include publicly-available samples from:{" "}
                </FieldTitle>
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
                  value="contextual"
                  checked={isContextual}
                  control={<StyledRadio />}
                  label={<RadioLabelContextual selected={isContextual} />}
                />
                <StyledFormControlLabel
                  value="local"
                  checked={isLocal}
                  control={<StyledRadio />}
                  label={<RadioLabelLocal selected={isLocal} />}
                />
              </RadioGroup>
            </TreeTypeSection>
            {failedSamples.length > 0 && (
              <Alert severity="warning">
                <InstructionsSemiBold>
                  {" "}
                  {failedSamples.length} Selected Sample
                  {failedSamples.length > 1 && "s"} {"won't"} be included in
                  your tree{" "}
                </InstructionsSemiBold>
                <InstructionsNotSemiBold>
                  because they failed genome recovery.
                </InstructionsNotSemiBold>
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
            Creating a new tree can take up to 12 hours. We will notify you when
            your tree is ready.
          </CreateTreeInfo>
        </Content>
      </DialogContent>
    </Dialog>
  );
};
