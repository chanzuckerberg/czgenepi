import { Button, Icon } from "czifui";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { useUserInfo } from "src/common/queries/auth";
import { useNamedLocations } from "src/common/queries/locations";
import { B } from "src/common/styles/basicStyle";
import {
  StyledCloseIconWrapper,
  StyledCloseIconButton,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { StyledCallout } from "src/components/AlertAccordion/style";
import { Content, Title } from "src/components/BaseDialog/style";
import Dialog from "src/components/Dialog";
import { prepEditMetadataTemplate } from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
import { WebformTable } from "src/components/WebformTable";
import {
  Metadata,
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
} from "src/components/WebformTable/common/types";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
import { SampleIdToWarningMessages } from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import { EditSampleMetaDataInstructions } from "./components/EditSampleMetadataInstructions";
import {
  EditSamplesReviewDialog,
  MetadataWithIdType,
} from "./components/EditSamplesReviewDialog";
import {
  EditSampleStatusModal,
  StatusModalView,
} from "./components/EditSampleStatusModal";
import ImportFile from "./components/ImportFile";
import { LoseProgressModal } from "./components/LoseProgressModal";
import { StyledPreTitle, StyledSubTitle } from "./style";
import {
  findMetadataChanges,
  getInitialMetadata,
  getMetadataEntryOrEmpty,
  setApplyAllValueToPrevMetadata,
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

export type MetadataType = SampleIdToEditMetadataWebform | null;

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
  const [metadataWithId, setMetadataWithId] =
    useState<MetadataWithIdType>(null);
  const [isContinueButtonActive, setIsContinueButtonActive] =
    useState<boolean>(false);
  const [isLoseProgessModalOpen, setLoseProgressModalOpen] =
    useState<boolean>(false);
  const [changedMetadata, setChangedMetadata] =
    useState<MetadataType>(EMPTY_OBJECT);
  const [hasImportedMetadataFile, setHasImportedMetadataFile] =
    useState<boolean>(false);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [userEditableSamples, setUserEditableSamples] = useState<Sample[]>([]);
  const [statusModalView, setStatusModalView] = useState<StatusModalView>(
    StatusModalView.NONE
  );
  const { data: userInfo } = useUserInfo();
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);

  const { data: namedLocationsData } = useNamedLocations();
  const namedLocations: NamedGisaidLocation[] =
    namedLocationsData?.namedLocations ?? [];
  const numSamplesCantEdit = checkedSamples.length - userEditableSamples.length;

  useEffect(() => {
    const samplesToEdit = checkedSamples.filter(
      (sample) => sample.submittingGroup?.id === currentGroup?.id
    );
    setUserEditableSamples(samplesToEdit);
  }, [checkedSamples, currentGroup?.name]);

  useEffect(() => {
    // continue button should only be active if the user has metadata
    // changes and that all form fields are filled out correctly
    if (!isEmpty(changedMetadata) && isValid) {
      setIsContinueButtonActive(true);
    } else {
      setIsContinueButtonActive(false);
    }
  }, [changedMetadata, isValid]);

  const clearState = function () {
    setCurrentModalStep(Steps.EDIT);
    setIsValid(false);
    setMetadata(null);
    setIsContinueButtonActive(false);
    setLoseProgressModalOpen(false);
    setChangedMetadata(null);
    setHasImportedMetadataFile(false);
    setAutocorrectWarnings(EMPTY_OBJECT);
    setStatusModalView(StatusModalView.NONE);
  };

  const handleClose = function () {
    setLoseProgressModalOpen(true);
  };

  const handleCloseLoseProgressModal = () => {
    setLoseProgressModalOpen(false);
  };

  const closeEditModal = () => {
    clearState();
    onClose();
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

  function resetMetadataFromEditableSamples() {
    const structuredMetadata = getInitialMetadata(userEditableSamples);
    setChangedMetadata(EMPTY_OBJECT);
    setMetadata(structuredMetadata);
  }

  useEffect(() => {
    // this is a bit of a hack, currently the modal rerenders itself and the user
    // loses userinput if focus is taken away from the modal,
    // to keep things less frustrating we're checking if the checkedSamples privateIds
    // match the privateIds in metadata to prevent rerendering before a user is finished making updates
    const currentPrivateIdentifiers = userEditableSamples.map(
      (sample) => sample.privateId
    );
    const metadataPrivateIdentifiers = metadata && Object.keys(metadata);
    if (
      JSON.stringify(currentPrivateIdentifiers) !=
      JSON.stringify(metadataPrivateIdentifiers)
    ) {
      resetMetadataFromEditableSamples();
    }
  }, [userEditableSamples, metadata]);

  // we need to send the sample id when we make the BE request to update
  // the sample, so let's track a version of metadata that has it
  useEffect(() => {
    if (!metadata) return;

    const metadataWithId: MetadataWithIdType = {};
    userEditableSamples.forEach((item) => {
      const { id, privateId } = item;
      const data = metadata[privateId] ?? {};
      metadataWithId[privateId] = {
        ...data,
        id,
      };
    });
    setMetadataWithId(metadataWithId);
  }, [userEditableSamples, metadata]);

  const numSamples = checkedSamples.length;

  const { templateInstructionRows, templateHeaders, templateRows } =
    useMemo(() => {
      // take the first collection location to populate Collection Location example rows of the sample edit tsv
      const collectionLocation = userEditableSamples[0]?.collectionLocation;
      const currentPrivateIdentifiers = userEditableSamples.map(
        (sample) => sample.privateId
      );
      return prepEditMetadataTemplate(
        currentPrivateIdentifiers,
        collectionLocation
      );
    }, [userEditableSamples]);

  const warningCantEditSamplesTitle = (
    <>
      <B>
        {numSamplesCantEdit} Selected {pluralize("Sample", numSamplesCantEdit)}{" "}
        can’t be edited
      </B>{" "}
      and {pluralize("has", numSamplesCantEdit)} been removed because{" "}
      {pluralize("it", numSamplesCantEdit)}{" "}
      {pluralize("is", numSamplesCantEdit)} managed by another jurisdiction.
    </>
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
          <div>
            <StyledCloseIconButton
              aria-label="Close edit samples modal"
              onClick={handleClose}
            >
              <StyledCloseIconWrapper>
                <Icon sdsIcon="xMark" sdsSize="l" sdsType="static" />
              </StyledCloseIconWrapper>
            </StyledCloseIconButton>
          </div>
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
              onConfirm={closeEditModal}
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
                  userEditableSamples={userEditableSamples}
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
                {numSamplesCantEdit > 0 && (
                  <StyledCallout intent={"warning"}>
                    {warningCantEditSamplesTitle}
                  </StyledCallout>
                )}
                <Button
                  disabled={!isContinueButtonActive}
                  onClick={() => setCurrentModalStep(Steps.REVIEW)}
                  sdsType="primary"
                  sdsStyle="rounded"
                >
                  Continue
                </Button>
              </>
            )}
            {currentModalStep === Steps.REVIEW && (
              <EditSamplesReviewDialog
                changedMetadata={changedMetadata}
                metadataWithId={metadataWithId}
                onClickBack={() => setCurrentModalStep(Steps.EDIT)}
                onSave={() => setStatusModalView(StatusModalView.LOADING)}
                onSaveFailure={() =>
                  setStatusModalView(StatusModalView.FAILURE)
                }
                onSaveSuccess={() =>
                  setStatusModalView(StatusModalView.SUCCESS)
                }
              />
            )}
            {statusModalView !== StatusModalView.NONE && (
              <EditSampleStatusModal
                statusModalView={statusModalView}
                onClose={() => {
                  if (statusModalView === StatusModalView.SUCCESS) {
                    closeEditModal();
                  } else {
                    setCurrentModalStep(Steps.EDIT);
                    setStatusModalView(StatusModalView.NONE);
                  }
                }}
              />
            )}
          </Content>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { EditSamplesConfirmationModal };
