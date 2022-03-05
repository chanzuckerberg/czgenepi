import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { pluralize } from "src/common/utils/strUtils";
import { Content, Title } from "src/components/BaseDialog/style";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import Dialog from "src/components/Dialog";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
} from "src/components/TreeNameInput/style";
import { NewTabLink } from "../../../NewTabLink";
import {
  StyledDiv,
  StyledIconButton,
  StyledPreTitle,
  StyledSubTitle,
} from "./style";

interface Props {
  checkedSamples: Sample[];
  onClose(): void;
  open: boolean;
}

const EditSamplesConfirmationModal = ({
  checkedSamples,
  onClose,
  open,
}: Props): JSX.Element | null => {
  const numSamples = checkedSamples.length;
  const title = "Edit Sample Metadata";

  const HREF =
    "https://docs.google.com/document/d/1QxNcDip31DA40SRIOmdV1I_ZC7rWDz5YQGk26Mr2kfA/edit";
  const instructionItems = [
    <InstructionsSemiBold key="1">
      Please refer to the
      <NewTabLink href={HREF}>
        {" "}
        Upload and Updating Metadata help documentation
      </NewTabLink>{" "}
      detailed instructions on setting up your file and troubleshooting errors
      and warnings.
    </InstructionsSemiBold>,
    <InstructionsNotSemiBold key="2">
      You can only import one file at a time. Importing a new file will
      overwrite previously imported data.
    </InstructionsNotSemiBold>,
    <InstructionsNotSemiBold key="3">
      Metadata will be imported to the webform table below, and any changes will
      be highlighted.
    </InstructionsNotSemiBold>,
  ];

  const secondSetInstructionItems = [
    <InstructionsSemiBold key="1">
      We recommend you copy your metadata into our TSV template, but you can
      import your own file as well. Accepted file formats: TSV, CSV.
    </InstructionsSemiBold>,
    <InstructionsNotSemiBold key="2">
      Column header naming conventions and metadata value formatting must match
      those found in the TSV template. See the help documentation above for more
      details.
    </InstructionsNotSemiBold>,
    <InstructionsNotSemiBold key="3">
      Do not include any personal identifying information (PII) in the Private
      or Public Sample IDs.
    </InstructionsNotSemiBold>,
  ];

  const closeIcon = (
    <StyledIconButton onClick={onClose}>
      <CloseIcon />
    </StyledIconButton>
  );

  return (
    <>
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown={false}
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <StyledDiv>{closeIcon}</StyledDiv>
          <StyledPreTitle>Step 1 of 2</StyledPreTitle>
          <Title>{title}</Title>
          <StyledSubTitle>
            {numSamples} {pluralize("Sample", numSamples)} Selected
          </StyledSubTitle>
        </DialogTitle>
        <DialogContent>
          <Content>
            <CollapsibleInstructions
              header="Import Data from TSV or CSV File"
              headerSize="m"
              instructionListTitle="Importing Files"
              items={instructionItems}
              shouldStartOpen
              secondInstructionListTitle="File Requirements"
              secondSetItems={secondSetInstructionItems}
            />
          </Content>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EditSamplesConfirmationModal };
