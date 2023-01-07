import { compact } from "lodash";
import { FunctionComponent, useEffect, useState } from "react";
import { DataTable } from "src/common/components";
import { VIEWNAME } from "src/common/constants/types";
import { SearchBar } from "src/components/Table/components/SearchBar";
import { DeleteTreeConfirmationModal } from "src/views/Data/components/TreesView/components/TreesTable/components/TreeActionMenu/components/MoreActionsMenu/components/DeleteTreeConfirmationModal";
import { EditTreeConfirmationModal } from "src/views/Data/components/TreesView/components/TreesTable/components/TreeActionMenu/components/MoreActionsMenu/components/EditTreeConfirmationModal";
import { TreeCreateHelpLink } from "src/views/Data/components/TreesView/components/TreeCreateHelpLink";
import {
  Divider,
  DownloadWrapper,
  SamplesTable,
  StyledBar,
  StyledChip,
  StyledDiv,
  StyledFlexChildDiv,
  StyledUploadButton,
  TooltipDescriptionText,
  TooltipHeaderText,
} from "./style";
import { TreeSelectionMenu } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/SampleTableActions/components/TreeSelectionMenu";
import { MoreActionsMenu } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/SampleTableActions/components/MoreActionMenu";
import DownloadModal from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/DownloadModal";
import { CreateNSTreeModal } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/CreateNSTreeModal";
import { UsherTreeFlow } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/UsherTreeFlow";
import { DeleteSamplesConfirmationModal } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/DeleteSamplesConfirmationModal";
import { EditSamplesConfirmationModal } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/EditSamplesConfirmationModal";
import { IconButton } from "src/views/Data/components/SamplesView/components/SampleTableModalManager/components/IconButton";
import { ROUTES } from "src/common/routes";

interface Props {
  data?: BioinformaticsMap;
  defaultSortKey: string[];
  headers: Header[];
  isLoading: boolean;
  renderer?: CustomRenderer;
  viewName: VIEWNAME;
  dataFilterFunc?: (data: TableItem[]) => TableItem[];
}

const DataSubview: FunctionComponent<Props> = ({
  data,
  defaultSortKey,
  headers,
  isLoading,
  renderer,
  viewName,
  dataFilterFunc,
}: Props) => {
  const [searchResults, setSearchResults] = useState<TableItem[]>([]);
  const [checkedSampleIds, setCheckedSampleIds] = useState<string[]>([]);
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [badOrFailedQCSampleIds, setBadOrFailedQCSampleIds] = useState<
    string[]
  >([]);
  const [isNSCreateTreeModalOpen, setIsNSCreateTreeModalOpen] =
    useState<boolean>(false);
  const [shouldStartUsherFlow, setShouldStartUsherFlow] =
    useState<boolean>(false);
  const [isDeleteSampleConfirmationOpen, setDeleteSampleConfirmationOpen] =
    useState<boolean>(false);
  const [isEditSampleConfirmationOpen, setEditSampleConfirmationOpen] =
    useState<boolean>(false);
  const [isDeleteTreeConfirmationOpen, setDeleteTreeConfirmationOpen] =
    useState<boolean>(false);
  const [phyloRunToDelete, setPhyloRunToDelete] = useState<PhyloRun>();
  const [isEditTreeConfirmationOpen, setEditTreeConfirmationOpen] =
    useState<boolean>(false);
  const [phyloRunToEdit, setPhyloRunToEdit] = useState<PhyloRun>();
  const [isSampleEditDisabled, setSampleEditDisabled] = useState<boolean>(true);

  useEffect(() => {
    const numberOfCheckedSamples = checkedSampleIds.length;
    if (numberOfCheckedSamples > 0 && numberOfCheckedSamples <= 100) {
      setSampleEditDisabled(false);
    } else {
      setSampleEditDisabled(true);
    }
  }, [checkedSampleIds]);

  const handleDownloadClickOpen = () => {
    setDownloadModalOpen(true);
  };

  const handleCreateNSTreeOpen = () => {
    setIsNSCreateTreeModalOpen(true);
  };

  const handleCreateTreeClose = () => {
    setIsNSCreateTreeModalOpen(false);
    setCheckedSampleIds([]);
    setBadOrFailedQCSampleIds([]);
  };

  const handleDownloadClose = () => {
    setDownloadModalOpen(false);
    setCheckedSampleIds([]);
    setBadOrFailedQCSampleIds([]);
  };
  useEffect(() => {
    if (shouldStartUsherFlow) setShouldStartUsherFlow(false);
  }, [shouldStartUsherFlow]);

  const handleDeleteSampleModalClose = () => {
    setDeleteSampleConfirmationOpen(false);
    setCheckedSampleIds([]);
  };

  const handleEditSampleModalClose = () => {
    setEditSampleConfirmationOpen(false);
    setCheckedSampleIds([]);
  };

  const handleDeleteTreeModalClose = () => {
    setDeleteTreeConfirmationOpen(false);
  };

  const handleEditTreeModalClose = () => {
    setEditTreeConfirmationOpen(false);
  };

  const handleDeleteTreeModalOpen = (phyloRun: PhyloRun) => {
    setPhyloRunToDelete(phyloRun);
    setDeleteTreeConfirmationOpen(true);
  };

  const handleEditTreeModalOpen = (phyloRun: PhyloRun) => {
    setPhyloRunToEdit(phyloRun);
    setEditTreeConfirmationOpen(true);
  };

  const DOWNLOAD_TOOLTIP_TEXT_DISABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
      <TooltipDescriptionText>Select at least 1 sample</TooltipDescriptionText>
    </div>
  );

  const DOWNLOAD_TOOLTIP_TEXT_ENABLED = (
    <div>
      <TooltipHeaderText>Download</TooltipHeaderText>
    </div>
  );

  const numCheckedSamples = checkedSampleIds?.length;
  const hasCheckedSamples = numCheckedSamples > 0;
  const hasTooManySamples = numCheckedSamples > 2000;

  const render = (tableData?: TableItem[]) => {
    let sampleActions: JSX.Element | null = null;
    if (viewName === VIEWNAME.SAMPLES && tableData !== undefined) {
      sampleActions = (
        <DownloadWrapper>
          <StyledChip
            isRounded
            label={checkedSampleIds.length}
            status="info"
            data-test-id="selected-sample-count"
          />
          <StyledDiv>Selected </StyledDiv>
          <Divider />
          <TreeSelectionMenu
            openNSTreeModal={handleCreateNSTreeOpen}
            openUsherModal={() => setShouldStartUsherFlow(true)}
            isMenuDisabled={hasTooManySamples}
            isUsherDisabled={!hasCheckedSamples}
          />
          <IconButton
            onClick={handleDownloadClickOpen}
            disabled={!hasCheckedSamples}
            sdsIcon="download"
            tooltipTextDisabled={DOWNLOAD_TOOLTIP_TEXT_DISABLED}
            tooltipTextEnabled={DOWNLOAD_TOOLTIP_TEXT_ENABLED}
            size="large"
          />
          <MoreActionsMenu
            disabled={!hasCheckedSamples}
            isSampleEditDisabled={isSampleEditDisabled}
            onDeleteSelected={() => setDeleteSampleConfirmationOpen(true)}
            onEditSelected={() => setEditSampleConfirmationOpen(true)}
            data-test-id="sample-page-more-action-btn"
          />
          <StyledUploadButton
            component="a"
            href={ROUTES.UPLOAD_STEP1}
            sdsType="primary"
            sdsStyle="rounded"
            data-test-id="upload-btn"
          >
            Upload
          </StyledUploadButton>
        </DownloadWrapper>
      );
    }

    // convert array of sample ids into a list of sample objects
    const checkedSamples = compact(
      checkedSampleIds.map((id) => data?.[id]) as Sample[]
    );
    return (
      <>
        {tableData !== undefined && viewName === VIEWNAME.SAMPLES && (
          <>
            <DownloadModal
              checkedSamples={(tableData as Sample[]).filter((sample) =>
                checkedSampleIds.includes(String(sample["publicId"]))
              )}
              open={isDownloadModalOpen}
              onClose={handleDownloadClose}
            />
            <CreateNSTreeModal
              badOrFailedQCSampleIds={badOrFailedQCSampleIds}
              checkedSampleIds={checkedSampleIds}
              open={isNSCreateTreeModalOpen}
              onClose={handleCreateTreeClose}
            />
            <UsherTreeFlow
              badOrFailedQCSampleIds={badOrFailedQCSampleIds}
              checkedSampleIds={checkedSampleIds}
              shouldStartUsherFlow={shouldStartUsherFlow}
              setBadOrFailedQCSampleIds={setBadOrFailedQCSampleIds}
            />
            <DeleteSamplesConfirmationModal
              checkedSamples={checkedSamples}
              onClose={handleDeleteSampleModalClose}
              open={isDeleteSampleConfirmationOpen}
            />
            <EditSamplesConfirmationModal
              checkedSamples={checkedSamples}
              onClose={handleEditSampleModalClose}
              open={isEditSampleConfirmationOpen}
            />
          </>
        )}
        {viewName === VIEWNAME.TREES && (
          <>
            <DeleteTreeConfirmationModal
              open={isDeleteTreeConfirmationOpen}
              onClose={handleDeleteTreeModalClose}
              phyloRun={phyloRunToDelete}
            />
            <EditTreeConfirmationModal
              open={isEditTreeConfirmationOpen}
              onClose={handleEditTreeModalClose}
              phyloRun={phyloRunToEdit}
            />
          </>
        )}
        <StyledFlexChildDiv>
          <StyledBar>
            <SearchBar onSearchComplete={setSearchResults} tableData={data} />
            {viewName === VIEWNAME.TREES && <TreeCreateHelpLink />}
            {viewName === VIEWNAME.SAMPLES && sampleActions}
          </StyledBar>
          <SamplesTable>
            <DataTable
              isLoading={isLoading}
              checkedSampleIds={checkedSampleIds}
              setCheckedSampleIds={setCheckedSampleIds}
              badOrFailedQCSampleIds={badOrFailedQCSampleIds}
              setBadOrFailedQCSampleIds={setBadOrFailedQCSampleIds}
              viewName={viewName}
              data={
                dataFilterFunc && tableData
                  ? dataFilterFunc(tableData)
                  : tableData
              }
              defaultSortKey={defaultSortKey}
              headers={headers}
              renderer={renderer}
              handleDeleteTreeModalOpen={handleDeleteTreeModalOpen}
              handleEditTreeModalOpen={handleEditTreeModalOpen}
            />
          </SamplesTable>
        </StyledFlexChildDiv>
      </>
    );
  };

  return render(searchResults);
};

export { DataSubview };
