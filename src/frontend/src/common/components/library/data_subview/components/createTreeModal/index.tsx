import { Dialog } from "@material-ui/core";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState } from "react";
import { useMutation } from "react-query";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { createTree } from "src/common/queries/trees";
import {
  Content,
  Header,
  StyledButton,
  StyledIconButton,
  Title,
} from "../DownloadModal/style";
import { RadioLabelContextual, RadioLabelLocal } from "./components/RadioLabel";
import {
  FieldTitle,
  InstructionsNotSemiBold,
  InstructionsSemiBold,
  StyledFormControlLabel,
  StyledInstructions,
  StyledInstructionsButton,
  StyledTextField,
  StyledRadio,
  TreeNameSection,
  TreeTypeSection,
  TreeNameInfoWrapper,
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
  const [treeType, setTreeType] = useState<string>("");
  const [areInstructionsShown, setInstructionsShown] = useState(false);
  console.log("tree name: ", treeName);
  console.log("tree type: ", treeType);
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

  const handleSubmit = (evt) => {
    evt.preventDefault();
    console.log(evt);
    // mutation.mutate({ sampleIds, treeName, treeType });
  };

  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <StyledIconButton onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
        <Header>Create New Phylogenetic Tree</Header>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
        </Title>
      </DialogTitle>
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
                id="outlined-basic"
                variant="outlined"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
              />
            </TreeNameSection>
            <TreeTypeSection>
              <FieldTitle>Include publicly-available samples from: </FieldTitle>
              <RadioGroup
                value={treeType}
                onChange={(e) => setTreeType(e.target.value)}
              >
                <StyledFormControlLabel
                  value="contextual"
                  control={<StyledRadio />}
                  label={<RadioLabelContextual />}
                />
                <StyledFormControlLabel
                  value="local"
                  control={<StyledRadio />}
                  label={<RadioLabelLocal />}
                />
              </RadioGroup>
            </TreeTypeSection>
            <StyledButton
              color="primary"
              variant="contained"
              isRounded
              disabled={false}
              type="submit"
              value="Submit"
            >
              Create Tree
            </StyledButton>
          </form>
        </Content>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
};
