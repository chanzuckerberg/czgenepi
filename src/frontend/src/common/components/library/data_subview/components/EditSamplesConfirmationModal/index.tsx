import CloseIcon from "@material-ui/icons/Close";
import { Button } from "czifui";
import React, { useMemo } from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { pluralize } from "src/common/utils/strUtils";
import { Content, Title } from "src/components/BaseDialog/style";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import Dialog from "src/components/Dialog";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
} from "src/components/TreeNameInput/style";
import { SampleEditTsvTemplateDownload } from "src/views/Upload/components/Metadata/components/ImportFile/components/DownloadTemplate";
import { prepEditMetadataTemplate } from "src/views/Upload/components/Metadata/components/ImportFile/prepMetadataTemplate";
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

  const { templateInstructionRows, templateHeaders, templateRows } =
    useMemo(() => {
      const collectionLocation = checkedSamples[0]?.collectionLocation;
      const currentPrivateIdentifiers = checkedSamples.map(
        (checkedSample) => checkedSample.privateId
      );
      return prepEditMetadataTemplate(
        currentPrivateIdentifiers || EMPTY_OBJECT,
        collectionLocation
      );
    }, [checkedSamples]);

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
          <SampleEditTsvTemplateDownload
            headers={templateHeaders}
            rows={templateRows}
            instructions={templateInstructionRows}
          >
            <Button color="primary">Download Metadata Template (TSV)</Button>
          </SampleEditTsvTemplateDownload>
          <Content>
            <CollapsibleInstructions
              header="Import Data from TSV or CSV File"
              headerSize="s"
              instructionListTitle="Importing Files"
              items={instructionItems}
              shouldStartOpen
              secondInstructionListTitle="File Requirements"
              secondSetItems={secondSetInstructionItems}
              InstructionsTitleMarginBottom="xxs"
              listItemFontSize="xs"
            />
          </Content>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EditSamplesConfirmationModal };
