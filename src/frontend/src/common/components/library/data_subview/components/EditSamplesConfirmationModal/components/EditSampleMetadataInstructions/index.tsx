import React from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import { SampleEditTsvTemplateDownload } from "src/components/DownloadMetadataTemplate";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
} from "src/components/TreeNameInput/style";
import { StyledButton } from "./style";

// TODO fix types
interface Props {
  templateInstructionRows: any;
  templateRows: any;
  templateHeaders: any;
}

const EditSampleMetaDataInstructions = ({
  templateInstructionRows,
  templateRows,
  templateHeaders,
}: Props): JSX.Element => {
  const downloadTSVButton = (
    <SampleEditTsvTemplateDownload
      headers={templateHeaders}
      rows={templateRows}
      instructions={templateInstructionRows}
    >
      <StyledButton sdsType="secondary">
        Download Metadata Template (TSV)
      </StyledButton>
    </SampleEditTsvTemplateDownload>
  );

  const instructionItems = [
    <InstructionsSemiBold key="1">
      Please refer to the Updating Metadata help documentation for detailed
      instructions on{" "}
      <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6430483116180-Editing-metadata">
        setting up your file
      </NewTabLink>{" "}
      and{" "}
      <NewTabLink href="https://help.czgenepi.org/hc/en-us/articles/6846628453652-Troubleshooting-guide-Updating-metadata">
        troubleshooting errors and warnings
      </NewTabLink>
      .
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

  return (
    <CollapsibleInstructions
      additionalHeaderLink={downloadTSVButton}
      header="Import Data from TSV or CSV File"
      headerSize="s"
      instructionListTitle="Importing Files"
      items={instructionItems}
      shouldStartOpen
      secondInstructionListTitle="File Requirements"
      secondSetItems={secondSetInstructionItems}
      instructionsTitleMarginBottom="xxs"
      listItemFontSize="xs"
    />
  );
};

export { EditSampleMetaDataInstructions };
