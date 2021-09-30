import { Dialog } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React, { useState } from "react";
import {
  Content,
  StyledButton,
  StyledDialogContent,
  StyledDialogTitle,
  StyledInfoOutlinedIcon,
  StyledTooltip,
  Title,
  TreeNameInfoWrapper,
  TreeNameSection,
} from "../createTreeModal/style";
import { Header, StyledIconButton } from "../DownloadModal/style";
import {
  FieldTitle,
  FieldTitleSettings,
  FlexWrapper,
  StyledList,
  StyledListItem,
  StyledTextField,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: any[];
  open: boolean;
  onClose: () => void;
}

export const UsherModal = ({
  sampleIds,
  failedSamples,
  open,
  onClose,
}: Props): JSX.Element => {
  const [isUsherDisabled, setUsherDisabled] = useState<boolean>(false);

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
        <FlexWrapper>
          <Header>Run Phylogenetic Placement with UShER</Header>
          <StyledTooltip
            arrow
            leaveDelay={1000}
            title={"Placeholder"}
            placement="top"
          >
            <StyledInfoOutlinedIcon />
          </StyledTooltip>
        </FlexWrapper>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
        </Title>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Content data-test-id="modal-content">
          <TreeNameSection>
            <TreeNameInfoWrapper>
              <FieldTitle>Use UShER for: </FieldTitle>
            </TreeNameInfoWrapper>
            <StyledList>
              <StyledListItem>
                Finding complete genome sequences from public repositories that
                are most genetically-similar to your selected samples.
              </StyledListItem>
              <StyledListItem>
                Placing your samples onto subtrees with closely-related public
                sequences.
              </StyledListItem>
              <StyledListItem>
                Ultrafast runtimes with comparable accuracy to Nextstrain for
                inferring relationships between samples.
              </StyledListItem>
              <StyledListItem>
                Note: To see all of your samples together on one tree with
                closely-related contextual sequences, or to enable more
                Nextstrain visualization features, use the Nextstrain tree build
                option. Learn more.
              </StyledListItem>
            </StyledList>
            <FieldTitle>Settings</FieldTitle>
            <FlexWrapper>
              <FieldTitleSettings>
                Place Samples onto Phylogenetic Tree Version:
              </FieldTitleSettings>
              <StyledTooltip
                arrow
                leaveDelay={1000}
                title={"Placeholder"}
                placement="top"
              >
                <StyledInfoOutlinedIcon />
              </StyledTooltip>
            </FlexWrapper>
            <FlexWrapper>
              <FieldTitleSettings>
                Number of samples per subtree showing sample placement:
              </FieldTitleSettings>
              <StyledTooltip
                arrow
                leaveDelay={1000}
                title={"Placeholder"}
                placement="top"
              >
                <StyledInfoOutlinedIcon />
              </StyledTooltip>
            </FlexWrapper>
            <StyledTextField
              id="outlined-basic"
              label="50"
              variant="outlined"
            />
          </TreeNameSection>
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            disabled={isUsherDisabled}
            type="submit"
            value="Submit"
          >
            Create Placement
          </StyledButton>
        </Content>
      </StyledDialogContent>
    </Dialog>
  );
};
