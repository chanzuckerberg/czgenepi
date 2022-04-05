import CloseIcon from "@material-ui/icons/Close";
import { pick } from "lodash";
import React, { useMemo, useState } from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { useNamedLocations } from "src/common/queries/locations";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { pluralize } from "src/common/utils/strUtils";
import { Content, Title } from "src/components/BaseDialog/style";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import Dialog from "src/components/Dialog";
import { SampleEditTsvTemplateDownload } from "src/components/DownloadMetadataTemplate";
import { prepEditMetadataTemplate } from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
import {
  InstructionsNotSemiBold,
  InstructionsSemiBold,
} from "src/components/TreeNameInput/style";
import { WebformTable } from "src/components/WebformTable";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "src/components/WebformTable/common/constants";
import {
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
} from "src/components/WebformTable/common/types";
import { ContinueButton } from "src/views/Upload/components/common/style";
import {
  StyledButton,
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
  const [isValid, setIsValid] = useState(false);
  const [metadata, setMetadata] =
    useState<SampleIdToEditMetadataWebform | null>(null);

  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations: NamedGisaidLocation[] =
    namedLocationsData?.namedLocations ?? [];

  function structureInitialMetadata(item: Sample): SampleEditMetadataWebform {
    const i: SampleEditMetadataWebform = pick(
      item,
      Object.keys(SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS)
    );
    if (i.collectionLocation) {
      i.collectionLocation.name = stringifyGisaidLocation(i.collectionLocation);
    }
    return i;
  }

  useMemo(() => {
    const structuredMetadata: SampleIdToEditMetadataWebform = {};
    checkedSamples.forEach((item) => {
      structuredMetadata[item.privateId] = structureInitialMetadata(item);
    });
    setMetadata(structuredMetadata);
  }, [checkedSamples]);

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
      // take the first collection location to populate Collection Location example rows of the sample edit tsv
      const collectionLocation = checkedSamples[0]?.collectionLocation;
      const currentPrivateIdentifiers = checkedSamples.map(
        (checkedSample) => checkedSample.privateId
      );
      return prepEditMetadataTemplate(
        currentPrivateIdentifiers,
        collectionLocation
      );
    }, [checkedSamples]);

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

  return (
    <>
      <Dialog
        disableBackdropClick
        // Dialogs and modals automatically focus themselves if some other element tries to steal the focus while they are open
        // We need this prop to allow the collectionLocation DropdownPopper component to work properly
        disableEnforceFocus
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
              additionalHeaderLink={downloadTSVButton}
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
            <WebformTable
              setIsValid={setIsValid}
              metadata={metadata}
              setMetadata={setMetadata}
              locations={namedLocations}
              webformTableType="EDIT"
            />
            <ContinueButton
              disabled={!isValid}
              sdsType="primary"
              sdsStyle="rounded"
            >
              Continue
            </ContinueButton>
          </Content>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EditSamplesConfirmationModal };
