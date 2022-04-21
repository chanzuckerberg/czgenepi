import CloseIcon from "@material-ui/icons/Close";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { useNamedLocations } from "src/common/queries/locations";
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
import {
  Metadata,
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
} from "src/components/WebformTable/common/types";
import { ContinueButton } from "src/views/Upload/components/common/style";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
import { ErrorsAndWarnings } from "./components/ErrorsAndWarnings";
import {
  StyledButton,
  StyledDiv,
  StyledIconButton,
  StyledPreTitle,
  StyledSubTitle,
} from "./style";
import {
  findMetadataChanges,
  getMetadataEntryOrEmpty,
  setApplyAllValueToPrevMetadata,
  structureInitialMetadata,
} from "./utils";

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
  const [isContinueButtonActive, setIsContinueButtonActive] =
    useState<boolean>(false);
  const [changedMetadata, setChangedMetadata] =
    useState<SampleIdToEditMetadataWebform | null>(null);
  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations: NamedGisaidLocation[] =
    namedLocationsData?.namedLocations ?? [];

  useEffect(() => {
    // continue button should only be active if the user has metadata
    // changes and that all form fields are filled out correctly
    if (changedMetadata && isValid) {
      setIsContinueButtonActive(true);
    } else {
      setIsContinueButtonActive(false);
    }
  }, [changedMetadata, isValid]);

  const clearState = function () {
    setChangedMetadata(null);
    setMetadata(null);
  };

  const handleClose = function () {
    clearState();
    onClose();
  };

  const updateChangedMetadata = useCallback(
    (id, sampleMetadata) => {
      // get all current metadata properties for a sample, if metadata is undefined return empty object
      const currentMetadata = getMetadataEntryOrEmpty(metadata, id);
      // combine current metadata with any new metadata requests from user
      const combinedMetadata: string | boolean | NamedGisaidLocation = {
        ...currentMetadata,
        ...sampleMetadata,
      };
      const metadataChanges = findMetadataChanges(
        combinedMetadata,
        currentMetadata
      );
      // save where the metadata has changed
      setChangedMetadata((prevMetadata) => {
        const metadataToUpdate = getMetadataEntryOrEmpty(prevMetadata, id);
        const updatedMetadata = { ...metadataToUpdate, ...metadataChanges };
        return { ...prevMetadata, [id]: updatedMetadata };
      });
    },
    [metadata]
  );

  const handleRowMetadata_ = (id: string, sampleMetadata: Metadata) => {
    updateChangedMetadata(id, sampleMetadata);
    setMetadata((prevMetadata) => {
      return { ...prevMetadata, [id]: sampleMetadata };
    });
  };

  const handleRowMetadata = useCallback(handleRowMetadata_, [
    updateChangedMetadata,
  ]);

  // TODO: update value type to be something other than undefined
  const applyToAllColumn_ = (fieldKey: keyof Metadata, value: undefined) => {
    setMetadata((prevMetadata) => {
      return setApplyAllValueToPrevMetadata(prevMetadata, fieldKey, value);
    });

    Object.keys(metadata || EMPTY_OBJECT).forEach((sampleId) => {
      setChangedMetadata((prevMetadata) => {
        const metadataToUpdate = getMetadataEntryOrEmpty(
          changedMetadata,
          sampleId
        );
        metadataToUpdate[fieldKey as keyof SampleEditMetadataWebform] = value;
        return { ...prevMetadata, [sampleId]: metadataToUpdate };
      });
    });
  };

  const applyToAllColumn = useCallback(applyToAllColumn_, [
    setMetadata,
    metadata,
    changedMetadata,
  ]);

  useMemo(() => {
    // this is a bit of a hack, currently the modal rerenders itself and the user
    // loses userinput if focus is taken away from the modal,
    // to keep things less frustrating we're checking if the checkedSamples privateIds
    // match the privateIds in metadata to prevent rerendering before a user is finished making updates
    const currentPrivateIdentifiers = checkedSamples.map(
      (checkedSample) => checkedSample.privateId
    );
    const metadataPrivateIdentifiers = metadata && Object.keys(metadata);
    if (
      JSON.stringify(currentPrivateIdentifiers) !=
      JSON.stringify(metadataPrivateIdentifiers)
    ) {
      const structuredMetadata: SampleIdToEditMetadataWebform = {};
      checkedSamples.forEach((item) => {
        structuredMetadata[item.privateId] = structureInitialMetadata(item);
      });
      setMetadata(structuredMetadata);
    }
  }, [checkedSamples, metadata]);

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
    <StyledIconButton onClick={handleClose}>
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
        // We need disableEnforceFocus to allow the collectionLocation DropdownPopper component to work properly
        disableEnforceFocus
        disableEscapeKeyDown={false}
        open={open}
        maxWidth="lg"
        fullWidth
        onClose={handleClose}
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
            <ErrorsAndWarnings />
            <WebformTable
              setIsValid={setIsValid}
              metadata={metadata}
              setMetadata={setMetadata}
              locations={namedLocations}
              applyToAllColumn={applyToAllColumn}
              handleRowMetadata={handleRowMetadata}
              webformTableType="EDIT"
            />
            <ContinueButton
              disabled={!isContinueButtonActive}
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
