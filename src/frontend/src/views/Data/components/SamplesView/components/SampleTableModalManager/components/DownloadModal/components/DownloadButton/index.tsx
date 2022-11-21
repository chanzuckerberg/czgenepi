import { useTreatments } from "@splitsoftware/splitio-react";
import { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import {
  AnalyticsSamplesDownloadFile,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import { analyticsTrackEvent } from "src/common/analytics/methods";
import { ORG_API } from "src/common/api";
import { tsvDataMap } from "src/common/components/library/data_subview";
import { useUserInfo } from "src/common/queries/auth";
import {
  FileDownloadResponsePayload,
  PUBLIC_REPOSITORY_NAME,
  useFileDownload,
} from "src/common/queries/samples";
import { addNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { SAMPLE_HEADERS, SAMPLE_SUBHEADERS } from "src/views/Data/headers";
import { mapTsvData } from "./mapTsvData";
import { StyledButton } from "./style";

interface Props {
  checkedSamples: Sample[];
  isFastaSelected: boolean;
  isGenbankSelected: boolean;
  isGisaidSelected: boolean;
  isMetadataSelected: boolean;
  completedSampleIds: string[];
  handleCloseModal(): void;
}

const DownloadButton = ({
  checkedSamples,
  isFastaSelected,
  isGenbankSelected,
  isGisaidSelected,
  isMetadataSelected,
  completedSampleIds,
  handleCloseModal,
}: Props): JSX.Element | null => {
  const dispatch = useDispatch();
  const { data: userInfo } = useUserInfo();

  const [tsvData, setTsvData] = useState<string[][]>([]);

  const tableRefactorFlag = useTreatments([USER_FEATURE_FLAGS.table_refactor]);
  const usesTableRefactor = isUserFlagOn(
    tableRefactorFlag,
    USER_FEATURE_FLAGS.table_refactor
  );

  useEffect(() => {
    if (usesTableRefactor) {
      const newTsvData = mapTsvData(checkedSamples);
      setTsvData(newTsvData);
    } else {
      if (!checkedSamples) return;

      const ids = checkedSamples.map((s) => s.publicId);
      const data = tsvDataMap(
        ids,
        checkedSamples,
        SAMPLE_HEADERS,
        SAMPLE_SUBHEADERS
      );

      const newTsvData = [data[0], ...data[1]];
      setTsvData(newTsvData);
    }
  }, [checkedSamples]);

  const useFileMutationGenerator = () =>
    useFileDownload({
      componentOnError: () => {
        dispatch(
          addNotification({
            componentKey: NotificationComponents.DOWNLOAD_FILES_FAILURE,
            intent: "error",
            shouldShowCloseButton: true,
          })
        );
        handleCloseModal();
      },
      componentOnSuccess: ({ data, filename }: FileDownloadResponsePayload) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(data);
        link.download = filename || "file-download";
        link.click();
        link.remove();
        handleCloseModal();
      },
    });

  const downloadMutation = useFileMutationGenerator();

  /**
   * Handle firing off analytics event when a samples download is initiated.
   *
   * Download button kicks off download, but underlying components within it
   * change depending on if fasta selected and/or if metadata selected.
   * This function deals with the analytics event for downloads, but need
   * to ensure it only gets called once, regardless of what combination
   * of fasta/metadata selection is in place.
   */
  const analyticsHandleDownload = (): void => {
    analyticsTrackEvent<AnalyticsSamplesDownloadFile>(
      EVENT_TYPES.SAMPLES_DOWNLOAD_FILE,
      {
        includes_consensus_genome: isFastaSelected,
        includes_genbank_template: isGenbankSelected,
        includes_gisaid_template: isGisaidSelected,
        includes_sample_metadata: isMetadataSelected,
        sample_count: completedSampleIds.length,
        sample_public_ids: JSON.stringify(completedSampleIds),
      }
    );
  };

  // format metadata file name for download file
  // fasta and template endpoints return the name
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const groupName = currentGroup?.name.toLowerCase().replace(/ /g, "_");
  const downloadDate = new Date().toISOString().slice(0, 10);
  const separator = "\t";
  const metadataDownloadName = `${groupName}_sample_metadata_${downloadDate}.tsv`;

  const isButtonDisabled = !(
    isFastaSelected ||
    isMetadataSelected ||
    isGisaidSelected ||
    isGenbankSelected
  );

  const onClick = () => {
    // button will have different functionality depending on download type selected

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
      {downloadMutation.isLoading ? "Loading" : "Download"}
    </StyledButton>
  );

  if (!isMetadataSelected) return downloadButton;

  return (
    <CSVLink
      data={tsvData}
      filename={metadataDownloadName}
      separator={separator}
      data-test-id="download-tsv-link"
    >
      {downloadButton}
    </CSVLink>
  );
};

export { DownloadButton };
