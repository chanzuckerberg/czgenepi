import { useEffect, useState } from "react";
import { CreateNSTreeModal } from "./components/CreateNSTreeModal";
import { DeleteSamplesConfirmationModal } from "./components/DeleteSamplesConfirmationModal";
import DownloadModal from "./components/DownloadModal";
import { EditSamplesConfirmationModal } from "./components/EditSamplesConfirmationModal";
import { SampleTableActions } from "./components/SampleTableActions";
import { UsherTreeFlow } from "./components/UsherTreeFlow";

interface Props {
  checkedSamples: Sample[];
  clearCheckedSamples(): void;
}

const SampleTableModalManager = ({
  checkedSamples,
  clearCheckedSamples,
}: Props): JSX.Element => {
  const [checkedSampleIds, setCheckedSampleIds] = useState<string[]>([]);
  const [failedSampleIds, setFailedSampleIds] = useState<string[]>([]);
  const [badQCSampleIds, setBadQCSampleIds] = useState<string[]>([]);
  const [canEditSamples, setCanEditSamples] = useState<boolean>(false);

  const [isDeleteSampleModalOpen, setIsDeleteSampleModalOpen] =
    useState<boolean>(false);
  const [isEditSampleModalOpen, setIsEditSampleModalOpen] =
    useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] =
    useState<boolean>(false);
  const [isNSCreateTreeModalOpen, setIsNSCreateTreeModalOpen] =
    useState<boolean>(false);
  const [shouldStartUsherFlow, setShouldStartUsherFlow] =
    useState<boolean>(false);

  // generate ID lists from sample objects
  useEffect(() => {
    const checkedIds = checkedSamples.map((s) => s.publicId);
    const failedIds = checkedSamples
      .filter((s) => s.CZBFailedGenomeRecovery)
      .map((s) => s.publicId);
    const badQCIds = checkedSamples
      // for now there should only ever be one qcMetrics entry per sample
      .filter((s) => s.qcMetrics[0].qc_status === "Bad")
      .map((s) => s.publicId);
    setCheckedSampleIds(checkedIds);
    setFailedSampleIds(failedIds);
    setBadQCSampleIds(badQCIds);
  }, [checkedSamples]);

  // determine whether selected samples can be edited
  useEffect(() => {
    const numberOfCheckedSamples = checkedSampleIds.length;
    if (numberOfCheckedSamples > 0 && numberOfCheckedSamples <= 100) {
      setCanEditSamples(true);
    } else {
      setCanEditSamples(false);
    }
  }, [checkedSampleIds]);

  useEffect(() => {
    if (shouldStartUsherFlow) setShouldStartUsherFlow(false);
  }, [shouldStartUsherFlow]);

  const handleDeleteSampleModalClose = () => {
    setIsDeleteSampleModalOpen(false);
    clearCheckedSamples();
  };

  const handleEditSampleModalClose = () => {
    setIsEditSampleModalOpen(false);
    clearCheckedSamples();
  };

  return (
    <>
      <DownloadModal
        checkedSamples={checkedSamples}
        failedSampleIds={failedSampleIds}
        open={isDownloadModalOpen}
        onClose={() => {
          setIsDownloadModalOpen(false);
          clearCheckedSamples();
        }}
      />
      <CreateNSTreeModal
        checkedSampleIds={checkedSampleIds}
        failedSampleIds={failedSampleIds}
        badQCSampleIds={badQCSampleIds}
        open={isNSCreateTreeModalOpen}
        onClose={() => setIsNSCreateTreeModalOpen(false)}
      />
      <UsherTreeFlow
        checkedSampleIds={checkedSampleIds}
        failedSampleIds={failedSampleIds}
        badQCSampleIds={badQCSampleIds}
        shouldStartUsherFlow={shouldStartUsherFlow}
      />
      <DeleteSamplesConfirmationModal
        checkedSamples={checkedSamples}
        onClose={handleDeleteSampleModalClose}
        open={isDeleteSampleModalOpen}
      />
      <EditSamplesConfirmationModal
        checkedSamples={checkedSamples}
        onClose={handleEditSampleModalClose}
        open={isEditSampleModalOpen}
      />
      <SampleTableActions
        canEditSamples={canEditSamples}
        checkedSampleIds={checkedSampleIds}
        openDeleteSampleModal={() => setIsDeleteSampleModalOpen(true)}
        openEditSampleModal={() => setIsEditSampleModalOpen(true)}
        openDownloadMenu={() => setIsDownloadModalOpen(true)}
        openNSTreeModal={() => setIsNSCreateTreeModalOpen(true)}
        openUsherModal={() => setShouldStartUsherFlow(true)}
      />
    </>
  );
};

export { SampleTableModalManager };
