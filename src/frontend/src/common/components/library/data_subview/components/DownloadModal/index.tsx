import { useTreatments } from "@splitsoftware/splitio-react";
import { Alert, Icon, Link, Tooltip } from "czifui";
import { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import {
  AnalyticsSamplesDownloadFile,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { ORG_API } from "src/common/api";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { useUserInfo } from "src/common/queries/auth";
import {
  FileDownloadResponsePayload,
  PUBLIC_REPOSITORY_NAME,
  useFileDownload,
} from "src/common/queries/samples";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import Dialog from "src/components/Dialog";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { FEATURE_FLAGS, isFlagOn } from "src/components/Split";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import {
  CheckBoxInfo,
  CheckboxLabel,
  Container,
  Content,
  DownloadType,
  DownloadTypeInfo,
  Header,
  StyledButton,
  StyledCheckbox,
  StyledFileTypeItem,
  Title,
} from "./style";

interface Props {
  checkedSampleIds: string[];
  failedSampleIds: string[];
  tsvData: [string[], string[][]] | undefined;
  open: boolean;
  onClose: () => void;
}

const DownloadModal = ({
  checkedSampleIds,
  failedSampleIds,
  tsvData,
  open,
  onClose,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const { data: userInfo } = useUserInfo();

  const [tsvRows, setTsvRows] = useState<string[][]>([]);
  const [tsvHeaders, setTsvHeaders] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const tooltipRef = useCallback((node: HTMLElement) => setAnchorEl(node), []);

  const [isFastaDisabled, setFastaDisabled] = useState<boolean>(false);
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isGisaidSelected, setGisaidSelected] = useState<boolean>(false);
  const [isGenbankSelected, setGenbankSelected] = useState<boolean>(false);

  const flag = useTreatments([FEATURE_FLAGS.prep_files]);
  const isPrepFilesFlagOn = isFlagOn(flag, FEATURE_FLAGS.prep_files);

  const completedSampleIds = checkedSampleIds.filter(
    (id) => !failedSampleIds.includes(id)
  );
  const nCompletedSampleIds = completedSampleIds.length;

  useEffect(() => {
    if (tsvData) {
      const [Headers, Rows] = tsvData;
      setTsvHeaders(Headers);
      setTsvRows(Rows);
    }
  }, [tsvData]);

  useEffect(() => {
    if (nCompletedSampleIds === 0) {
      setFastaDisabled(true);
    } else {
      setFastaDisabled(false);
    }
  }, [nCompletedSampleIds, setFastaDisabled]);

  const handleMetadataClick = function () {
    setMetadataSelected(!isMetadataSelected);
  };

  const handleFastaClick = function () {
    setFastaSelected(!isFastaSelected);
  };

  const handleGisaidClick = function () {
    setGisaidSelected(!isGisaidSelected);
  };

  const handleGenbankClick = function () {
    setGenbankSelected(!isGenbankSelected);
  };

  const handleCloseModal = () => {
    setFastaSelected(false);
    setMetadataSelected(false);
    setGenbankSelected(false);
    setGisaidSelected(false);
    onClose();
  };

  // format metadata file name for download file
  // fasta and template endpoints return the name
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const groupName = currentGroup?.name.toLowerCase().replace(/ /g, "_");
  const downloadDate = new Date().toISOString().slice(0, 10);
  const separator = "\t";
  const metadataDownloadName = `${groupName}_sample_metadata_${downloadDate}.tsv`;

  const useFileMutationGenerator = () =>
    useFileDownload({
      componentOnError: () => {
        dispatch(addNotification({
          componentKey: NotificationComponents.DOWNLOAD_FILES_FAILURE,
          notifId: Date.now(),
          intent: "error",
          shouldShowCloseButton: true,
        }));
        handleCloseModal();
      },
      componentOnSuccess: ({ data, filename }: FileDownloadResponsePayload) => {
        // TODO (mlila): may need to modify behavior here for gisaid/genbank multi-file download
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = filename || "file-download";
        link.click();
        link.remove();
        handleCloseModal();
      },
    });

  const downloadMutation = useFileMutationGenerator();

  const FASTA_DISABLED_TOOLTIP_TEXT = (
    <div>
      <TooltipHeaderText>
        No Consensus Genomes available for download
      </TooltipHeaderText>
      <TooltipDescriptionText>
        Select at least 1 sample with successful genome recovery.
      </TooltipDescriptionText>
    </div>
  );

  return (
    <>
      <Dialog disableEscapeKeyDown open={open} onClose={handleCloseModal}>
        <DialogTitle>
          <StyledCloseIconButton
            aria-label="close download modal"
            onClick={handleCloseModal}
          >
            <StyledCloseIconWrapper>
              <Icon sdsIcon="xMark" sdsSize="l" sdsType="static" />
            </StyledCloseIconWrapper>
          </StyledCloseIconButton>
          <Header>Select Download</Header>
          <Title>
            {checkedSampleIds.length}{" "}
            {pluralize("Sample", checkedSampleIds.length)} Selected
          </Title>
        </DialogTitle>
        <DialogContent>
          <Content data-test-id="modal-content">
            <Container>
              <Tooltip
                arrow
                inverted
                title={FASTA_DISABLED_TOOLTIP_TEXT}
                disableHoverListener={!isFastaDisabled}
                placement="top"
                PopperProps={{
                  anchorEl,
                }}
              >
                <StyledFileTypeItem
                  isDisabled={isFastaDisabled}
                  isSelected={isFastaSelected}
                >
                  <CheckBoxInfo>
                    <StyledCheckbox
                      disabled={isFastaDisabled}
                      id="download-fasta-checkbox"
                      onChange={handleFastaClick}
                      stage={isFastaSelected ? "checked" : "unchecked"}
                    />
                  </CheckBoxInfo>
                  <CheckboxLabel htmlFor="download-fasta-checkbox">
                    <DownloadType>Consensus Genome</DownloadType>{" "}
                    <span ref={tooltipRef}>(.fasta)</span>
                    <DownloadTypeInfo>
                      Download multiple consensus genomes in a single,
                      concatenated file
                    </DownloadTypeInfo>
                  </CheckboxLabel>
                </StyledFileTypeItem>
              </Tooltip>
              <div style={{ height: "4px" }}></div>
              <StyledFileTypeItem isSelected={isMetadataSelected}>
                <CheckBoxInfo>
                  <StyledCheckbox
                    id="download-metadata-checkbox"
                    onChange={handleMetadataClick}
                    stage={isMetadataSelected ? "checked" : "unchecked"}
                  />
                </CheckBoxInfo>
                <CheckboxLabel htmlFor="download-metadata-checkbox">
                  <DownloadType>Sample Metadata </DownloadType> (.tsv)
                  <DownloadTypeInfo>
                    Sample metadata including Private and Public IDs, Collection
                    Date, Sequencing Date, Lineage, GISAID Status, and ISL
                    Accession #.
                  </DownloadTypeInfo>
                </CheckboxLabel>
              </StyledFileTypeItem>
              {isPrepFilesFlagOn && (
                <StyledFileTypeItem isSelected={isGisaidSelected}>
                  <CheckBoxInfo>
                    <StyledCheckbox
                      id="download-gisaid-checkbox"
                      onChange={handleGisaidClick}
                      stage={isGisaidSelected ? "checked" : "unchecked"}
                    />
                  </CheckBoxInfo>
                  <CheckboxLabel htmlFor="download-gisaid-checkbox">
                    <DownloadType>GISAID Submission Template </DownloadType>{" "}
                    (.fasta, .csv)
                    <DownloadTypeInfo>
                      Download concatenated consensus genomes and metadata files
                      formatted to prepare samples for submission to GISAID.{" "}
                      <Link
                        href="https://help.czgenepi.org/hc/en-us/articles/8179880474260"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn More.
                      </Link>
                    </DownloadTypeInfo>
                  </CheckboxLabel>
                </StyledFileTypeItem>
              )}
              {isPrepFilesFlagOn && (
                <StyledFileTypeItem isSelected={isGenbankSelected}>
                  <CheckBoxInfo>
                    <StyledCheckbox
                      id="download-genbank-checkbox"
                      onChange={handleGenbankClick}
                      stage={isGenbankSelected ? "checked" : "unchecked"}
                    />
                  </CheckBoxInfo>
                  <CheckboxLabel htmlFor="download-genbank-checkbox">
                    <DownloadType>Genbank Submission Template </DownloadType>{" "}
                    (.fasta, .tsv)
                    <DownloadTypeInfo>
                      Download concatenated consensus genomes and metadata files
                      formatted to prepare samples for submission to Genbank.{" "}
                      <Link
                        href="https://help.czgenepi.org/hc/en-us/articles/8179961027604"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn More.
                      </Link>
                    </DownloadTypeInfo>
                  </CheckboxLabel>
                </StyledFileTypeItem>
              )}
            </Container>
            {failedSampleIds.length > 0 &&
              !isFastaDisabled && ( //ignore alert if fasta is already disabled
                <Alert severity="warning">
                  <DownloadType>
                    {failedSampleIds.length}{" "}
                    {pluralize("sample", failedSampleIds.length)} will not be
                    included in your Consensus Genome or Submission Template
                    downloads
                  </DownloadType>
                  <DownloadTypeInfo>
                    because they failed genome recovery. Failed samples will
                    still be included in your Sample Metadata download.
                  </DownloadTypeInfo>
                </Alert>
              )}
            {getDownloadButton()}
          </Content>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );

  /**
   * Handle firing off analytics event when a samples download is initiated.
   *
   * Download button kicks off download, but underlying components within it
   * change depending on if fasta selected and/or if metadata selected.
   * This function deals with the analytics event for downloads, but need
   * to ensure it only gets called once, regardless of what combination
   * of fasta/metadata selection is in place.
   */
  function analyticsHandleDownload(): void {
    analyticsTrackEvent<AnalyticsSamplesDownloadFile>(
      EVENT_TYPES.SAMPLES_DOWNLOAD_FILE,
      {
        includes_consensus_genome: isFastaSelected,
        includes_genbank_template: isGenbankSelected,
        includes_gisaid_template: isGisaidSelected,
        includes_sample_metadata: isMetadataSelected,
        sample_count: nCompletedSampleIds,
        sample_public_ids: JSON.stringify(completedSampleIds),
      }
    );
  }

  function getDownloadButton(): JSX.Element | undefined {
    // button will have different functionality depending on download type selected

    const isButtonDisabled = !(
      isFastaSelected ||
      isMetadataSelected ||
      isGisaidSelected ||
      isGenbankSelected
    );

    const onClick = () => {
      if (isFastaSelected) {
        downloadMutation.mutate({
          endpoint: ORG_API.SAMPLES_FASTA_DOWNLOAD,
          sampleIds: completedSampleIds,
        });
      }

      if (isGisaidSelected) {
        downloadMutation.mutate({
          endpoint: ORG_API.SAMPLES_FASTA_DOWNLOAD,
          publicRepositoryName: PUBLIC_REPOSITORY_NAME.GISAID,
          sampleIds: completedSampleIds,
        });
        downloadMutation.mutate({
          endpoint: ORG_API.SAMPLES_TEMPLATE_DOWNLOAD,
          publicRepositoryName: PUBLIC_REPOSITORY_NAME.GISAID,
          sampleIds: completedSampleIds,
        });
      }

      if (isGenbankSelected) {
        downloadMutation.mutate({
          endpoint: ORG_API.SAMPLES_FASTA_DOWNLOAD,
          publicRepositoryName: PUBLIC_REPOSITORY_NAME.GENBANK,
          sampleIds: completedSampleIds,
        });
        downloadMutation.mutate({
          endpoint: ORG_API.SAMPLES_TEMPLATE_DOWNLOAD,
          publicRepositoryName: PUBLIC_REPOSITORY_NAME.GENBANK,
          sampleIds: completedSampleIds,
        });
      }

      analyticsHandleDownload();
    };

    const downloadButton = (
      <StyledButton
        sdsType="primary"
        sdsStyle="rounded"
        disabled={isButtonDisabled}
        onClick={onClick}
      >
        {getDownloadButtonText()}
      </StyledButton>
    );

    if (!isMetadataSelected) return downloadButton;

    return (
      <CSVLink
        data={tsvRows}
        headers={tsvHeaders}
        filename={metadataDownloadName}
        separator={separator}
        data-test-id="download-tsv-link"
      >
        {downloadButton}
      </CSVLink>
    );
  }

  function getDownloadButtonText() {
    if (downloadMutation.isLoading) {
      return "Loading";
    } else {
      return "Download";
    }
  }
};

export default DownloadModal;
