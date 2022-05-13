import CloseIcon from "@material-ui/icons/Close";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { useNamedLocations } from "src/common/queries/locations";
import { pluralize } from "src/common/utils/strUtils";
import { Content, Title } from "src/components/BaseDialog/style";
import Dialog from "src/components/Dialog";
import { prepEditMetadataTemplate } from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
import { WebformTable } from "src/components/WebformTable";
import {
  Metadata,
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
} from "src/components/WebformTable/common/types";
import { ContinueButton } from "src/views/Upload/components/common/style";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
import { SampleIdToWarningMessages } from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import { EditSampleMetaDataInstructions } from "./components/EditSampleMetadataInstructions";
import { EditSamplesReviewDialog } from "./components/EditSamplesReviewDialog";
import ImportFile from "./components/ImportFile";
import { LoseProgressModal } from "./components/LoseProgressModal";
import {
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

enum Steps {
  EDIT = 1,
  REVIEW = 2,
}

type MetadataType = SampleIdToEditMetadataWebform | null;

export interface FileUploadProps {
  uploadedMetadata: MetadataType;
  changedMetadataUpdated: MetadataType;
  autocorrectWarnings: SampleIdToWarningMessages;
}

const EditSamplesConfirmationModal = ({
  checkedSamples,
  onClose,
  open,
}: Props): JSX.Element | null => {
  const [currentModalStep, setCurrentModalStep] = useState<Steps>(Steps.EDIT);
  const [isValid, setIsValid] = useState(false);
  const [metadata, setMetadata] = useState<MetadataType>(null);
  const [isContinueButtonActive, setIsContinueButtonActive] =
    useState<boolean>(false);
  const [isLoseProgessModalOpen, setLoseProgressModalOpen] =
    useState<boolean>(false);
  const [changedMetadata, setChangedMetadata] =
    useState<MetadataType>(EMPTY_OBJECT);
  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations: NamedGisaidLocation[] =
    namedLocationsData?.namedLocations ?? [];
  const [hasImportedMetadataFile, setHasImportedMetadataFile] =
    useState<boolean>(false);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);

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
    setHasImportedMetadataFile(false);
    setLoseProgressModalOpen(false);
  };

  const handleClose = function () {
    setLoseProgressModalOpen(true);
  };

  const handleCloseLoseProgressModal = () => {
    setLoseProgressModalOpen(false);
  };

  const handleConfirmLoseProgressModal = () => {
    onClose();
    clearState();
  };

  const handleMetadataFileUploaded = ({
    uploadedMetadata,
    changedMetadataUpdated,
    autocorrectWarnings,
  }: FileUploadProps) => {
    setMetadata(uploadedMetadata);
    setChangedMetadata(changedMetadataUpdated);
    setHasImportedMetadataFile(true);
    setAutocorrectWarnings(autocorrectWarnings);
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

  function resetMetadataFromCheckedSamples() {
    const structuredMetadata: SampleIdToEditMetadataWebform = {};
    checkedSamples.forEach((item) => {
      structuredMetadata[item.privateId] = structureInitialMetadata(item);
    });
    setChangedMetadata(EMPTY_OBJECT);
    setMetadata(structuredMetadata);
  }

  useEffect(() => {
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
      resetMetadataFromCheckedSamples();
    }
  }, [checkedSamples, metadata]);

  const numSamples = checkedSamples.length;

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
          <StyledDiv>
            <StyledIconButton onClick={handleClose}>
              <CloseIcon />
            </StyledIconButton>
          </StyledDiv>
          <StyledPreTitle>Step {currentModalStep} of 2</StyledPreTitle>
          <Title>Edit Sample Metadata</Title>
          <StyledSubTitle>
            {numSamples} {pluralize("Sample", numSamples)} Selected
          </StyledSubTitle>
        </DialogTitle>
        <DialogContent>
          <Content>
            <LoseProgressModal
              isModalOpen={isLoseProgessModalOpen}
              onClose={handleCloseLoseProgressModal}
              onConfirm={handleConfirmLoseProgressModal}
            />
            {currentModalStep === Steps.EDIT && (
              <>
                <EditSampleMetaDataInstructions
                  templateInstructionRows={templateInstructionRows}
                  templateRows={templateRows}
                  templateHeaders={templateHeaders}
                />
                <ImportFile
                  metadata={metadata}
                  changedMetadata={changedMetadata}
                  resetMetadataFromCheckedSamples={
                    resetMetadataFromCheckedSamples
                  }
                  namedLocations={namedLocations}
                  hasImportedMetadataFile={hasImportedMetadataFile}
                  onMetadataFileUploaded={handleMetadataFileUploaded}
                />
                <WebformTable
                  setIsValid={setIsValid}
                  metadata={metadata}
                  hasImportedMetadataFile={hasImportedMetadataFile}
                  setMetadata={setMetadata}
                  autocorrectWarnings={autocorrectWarnings}
                  locations={namedLocations}
                  applyToAllColumn={applyToAllColumn}
                  handleRowMetadata={handleRowMetadata}
                  webformTableType="EDIT"
                />
                <ContinueButton
                  disabled={!isContinueButtonActive}
                  onClick={() => setCurrentModalStep(Steps.REVIEW)}
                  sdsType="primary"
                  sdsStyle="rounded"
                >
                  Continue
                </ContinueButton>
              </>
            )}
            {currentModalStep === Steps.REVIEW && (
              <EditSamplesReviewDialog
                changedMetaData={changedMetadata}
                onClickBack={() => setCurrentModalStep(Steps.EDIT)}
              />
            )}
          </Content>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EditSamplesConfirmationModal };
