import { useTreatments } from "@splitsoftware/splitio-react";
import { Alert, Icon, Link, Tooltip } from "czifui";
import { isEqual, noop } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { useUserInfo } from "src/common/queries/auth";
import { useFastaDownload } from "src/common/queries/samples";
import { B } from "src/common/styles/basicStyle";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import Dialog from "src/components/Dialog";
import Notification from "src/components/Notification";
import { FEATURE_FLAGS, isFlagOn } from "src/components/Split";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import { ContactUsLink } from "../ContactUsLink";
import {
  CheckBoxInfo,
  CheckboxLabel,
  Container,
  Content,
  DownloadType,
  DownloadTypeInfo,
  Header,
  StyledButton,
  StyledCallout,
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
  const { data: userInfo } = useUserInfo();
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const groupName = currentGroup?.name.toLowerCase().replace(/ /g, "_"); // format group name for sequences download file
  const downloadDate = new Date();
  const separator = "\t";
  const fastaDownloadName = `${groupName}_sample_sequences_${downloadDate
    .toISOString()
    .slice(0, 10)}.fasta`;
  const metadataDownloadName = `${groupName}_sample_metadata_${downloadDate
    .toISOString()
    .slice(0, 10)}.tsv`;
  const [tsvRows, setTsvRows] = useState<string[][]>([]);
  const [tsvHeaders, setTsvHeaders] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const tooltipRef = useCallback((node) => setAnchorEl(node), []);

  const [isFastaDisabled, setFastaDisabled] = useState<boolean>(false);
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isGisaidSelected, setGisaidSelected] = useState<boolean>(false);
  const [isGenbankSelected, setGenbankSelected] = useState<boolean>(false);
  const [shouldShouldError, setShouldShowError] = useState<boolean>(false);

  const flag = useTreatments([FEATURE_FLAGS.prep_files]);
  const isPrepFilesFlagOn = isFlagOn(flag, FEATURE_FLAGS.prep_files);

  useEffect(() => {
    if (tsvData) {
      const [Headers, Rows] = tsvData;
      setTsvHeaders(Headers);
      setTsvRows(Rows);
    }
  }, [tsvData]);

  useEffect(() => {
    if (isEqual(checkedSampleIds, failedSampleIds)) {
      setFastaDisabled(true);
    } else {
      setFastaDisabled(false);
    }
  }, [checkedSampleIds, failedSampleIds, setFastaDisabled]);

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
    onClose();
  };

  const fastaDownloadMutation = useFastaDownload({
    componentOnError: () => {
      setShouldShowError(true);
      handleCloseModal();
    },
    componentOnSuccess: (data: Blob) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(data);
      link.download = fastaDownloadName;
      link.click();
      link.remove();
      handleCloseModal();
    },
  });

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
      <Notification
        buttonOnClick={() => setShouldShowError(false)}
        buttonText="DISMISS"
        dismissDirection="right"
        dismissed={!shouldShouldError}
        intent="error"
      >
        <B>
          Something went wrong and we were unable to complete one or more of
          your downloads
        </B>{" "}
        <ContactUsLink />
      </Notification>
      <Dialog
        disableEscapeKeyDown
        disableBackdropClick
        open={open}
        onClose={handleCloseModal}
      >
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
                      {/* TODO: (194961) - update href */}
                      <Link href="" target="_blank" rel="noreferrer">
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
                      {/* TODO: (194962) - update href */}
                      <Link href="" target="_blank" rel="noreferrer">
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
                    included in your Consensus Genome download
                  </DownloadType>
                  <DownloadTypeInfo>
                    because they failed genome recovery. Failed samples will
                    still be included in your Sample Metadata download.
                  </DownloadTypeInfo>
                </Alert>
              )}
            {checkedSampleIds.length - failedSampleIds.length > 999 &&
              (isGisaidSelected || isGenbankSelected) && (
                <StyledCallout intent="info" autoDismiss={false}>
                  Your submission template download will be generated in
                  multiple files of up to 999 samples in order to comply with
                  GISAID/GenBank upload limits.
                </StyledCallout>
              )}
            {getDownloadButton()}
          </Content>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );

  // TODO:(194961) update for GISAID template download
  // TODO:(194962) update for GenBank template download
  function getDownloadButton(): JSX.Element | undefined {
    // button will have different functionality depending on download type selected

    const isButtonDisabled = !isFastaSelected && !isMetadataSelected;
    const downloadFasta = () => {
      fastaDownloadMutation.mutate({ sampleIds: checkedSampleIds });
    };
    const onClick = isFastaSelected ? downloadFasta : noop;

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
    if (fastaDownloadMutation.isLoading) {
      return "Loading";
    } else {
      return "Download";
    }
  }
};

export default DownloadModal;
