import { Dialog } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Alert, Tooltip } from "czifui";
import React, { useCallback, useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useMutation } from "react-query";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { useUserInfo } from "src/common/queries/auth";
import { downloadSamplesFasta } from "src/common/queries/samples";
import { TooltipDescriptionText, TooltipHeaderText } from "../../style";
import {
  CheckBoxInfo,
  CheckBoxWrapper,
  Container,
  Content,
  DownloadType,
  DownloadTypeInfo,
  Header,
  StyledButton,
  StyledCheckbox,
  StyledIconButton,
  StyledSpan,
  Title,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: any[];
  isMetadataSelected: boolean;
  setMetadataSelected: (prevState: boolean) => void;
  isFastaSelected: boolean;
  setFastaSelected: (prevState: boolean) => void;
  isFastaDisabled: boolean;
  setFastaDisabled: (prevState: boolean) => void;
  tsvData: [string[], string[][]] | undefined;
  open: boolean;
  onClose: () => void;
  setDownloadFailed: (hasFailed: boolean) => void;
}

const DownloadModal = ({
  sampleIds,
  failedSamples,
  isMetadataSelected,
  setMetadataSelected,
  isFastaSelected,
  setFastaSelected,
  isFastaDisabled,
  setFastaDisabled,
  tsvData,
  open,
  onClose,
  setDownloadFailed,
}: Props): JSX.Element => {
  const { data } = useUserInfo();
  const groupName = data?.group?.name.toLowerCase().replace(/ /g, "_"); // format group name for sequences download file
  const downloadDate = new Date();
  const separator = "\t";
  const [tsvRows, setTsvRows] = useState<string[][]>([]);
  const [tsvHeaders, setTsvHeaders] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const tooltipRef = useCallback((node) => setAnchorEl(node), []);

  useEffect(() => {
    if (tsvData) {
      const [Headers, Rows] = tsvData;
      setTsvHeaders(Headers);
      setTsvRows(Rows);
    }
  }, [tsvData]);

  useEffect(() => {
    if (JSON.stringify(sampleIds) === JSON.stringify(failedSamples)) {
      setFastaDisabled(true);
    } else {
      setFastaDisabled(false);
    }
  }, [sampleIds, failedSamples]);

  const handleMetadataClick = function () {
    setMetadataSelected(!isMetadataSelected);
  };

  const handleFastaClick = function () {
    setFastaSelected(!isFastaSelected);
  };

  const mutation = useMutation(downloadSamplesFasta, {
    onError: () => {
      setDownloadFailed(true);
    },
    onSuccess: (data: any) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(data);
      link.download = `${groupName}_sample_sequences_${downloadDate
        .toISOString()
        .slice(0, 10)}.fasta`;
      link.click();
      link.remove();
      onClose();
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
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <StyledIconButton onClick={onClose}>
          <CloseIcon />
        </StyledIconButton>
        <Header>Select Download</Header>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
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
              <StyledSpan style={getBackgroundFastaColor()}>
                <CheckBoxWrapper>
                  <CheckBoxInfo>
                    <StyledCheckbox
                      color="primary"
                      onClick={handleFastaClick}
                      disabled={isFastaDisabled}
                    />
                  </CheckBoxInfo>
                  <CheckBoxInfo>
                    <DownloadType style={getBackgroundFastaColor()}>
                      Consensus Genome{" "}
                    </DownloadType>{" "}
                    <span ref={tooltipRef}>(consensus.fa)</span>
                    <DownloadTypeInfo>
                      Download multiple consensus genomes in a single,
                      concatenated file
                    </DownloadTypeInfo>
                  </CheckBoxInfo>
                </CheckBoxWrapper>
              </StyledSpan>
            </Tooltip>
            <div style={{ height: "4px" }}></div>
            <CheckBoxWrapper style={getBackgroundColor(isMetadataSelected)}>
              <CheckBoxInfo>
                <StyledCheckbox color="primary" onClick={handleMetadataClick} />
              </CheckBoxInfo>
              <CheckBoxInfo>
                <DownloadType>Sample Metadata </DownloadType>{" "}
                (sample_metadata.tsv)
                <DownloadTypeInfo>
                  Sample metadata including Private and Public IDs, Collection
                  Date, Sequencing Date, Lineage, GISAID Status, and ISL
                  Accession #.
                </DownloadTypeInfo>
              </CheckBoxInfo>
            </CheckBoxWrapper>
          </Container>
          {failedSamples.length > 0 &&
            !isFastaDisabled && ( //ignore alert if fasta is already disabled
              <Alert severity="warning">
                <DownloadType>
                  {" "}
                  {failedSamples.length} sample{failedSamples.length > 1 && "s"}{" "}
                  will not be included in your Consensus Genome download
                </DownloadType>
                <DownloadTypeInfo>
                  because they failed genome recovery. Failed samples will still
                  be included in your Sample Metadata download.
                </DownloadTypeInfo>
              </Alert>
            )}
          {getDownloadButton()}
        </Content>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );

  function getBackgroundFastaColor() {
    if (isFastaDisabled) {
      // TODO: access this styling with props instead of hardcoding
      return { backgroundColor: "transparent", color: "#999999" };
    } else {
      return getBackgroundColor(isFastaSelected);
    }
  }

  function getBackgroundColor(parameterSelected: boolean) {
    if (parameterSelected) {
      // TODO: access this styling with props instead of hardcoding
      return { backgroundColor: "#F8F8F8" };
    }
  }

  function getDownloadButton(): JSX.Element | undefined {
    // button will have different functionality depending on download type selected
    const metadataFilename = `${groupName}_sample_sequences_${downloadDate
      .toISOString()
      .slice(0, 10)}_metadata.tsv`;

    if (isMetadataSelected && !isFastaSelected) {
      return (
        <CSVLink
          data={tsvRows}
          headers={tsvHeaders}
          filename={metadataFilename}
          separator={separator}
          data-test-id="download-tsv-link"
        >
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            disabled={false}
            onClick={onClose}
          >
            {getDownloadButtonText()}
          </StyledButton>
        </CSVLink>
      );
    }

    if (isMetadataSelected && isFastaSelected) {
      return (
        <CSVLink
          data={tsvRows}
          headers={tsvHeaders}
          filename={metadataFilename}
          separator={separator}
          data-test-id="download-tsv-link"
        >
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            onClick={() => {
              mutation.mutate({ sampleIds });
            }}
            disabled={false}
          >
            {getDownloadButtonText()}
          </StyledButton>
        </CSVLink>
      );
    }

    if (isFastaSelected && !isMetadataSelected) {
      return (
        <StyledButton
          color="primary"
          variant="contained"
          isRounded
          onClick={() => {
            mutation.mutate({ sampleIds });
          }}
          disabled={false}
        >
          {getDownloadButtonText()}
        </StyledButton>
      );
    }

    if (!isFastaSelected && !isMetadataSelected) {
      return (
        <StyledButton
          color="primary"
          variant="contained"
          isRounded
          onClick={() => {
            mutation.mutate({ sampleIds });
          }}
          disabled={true}
        >
          {getDownloadButtonText()}
        </StyledButton>
      );
    }
  }

  function getDownloadButtonText() {
    if (mutation.isLoading) {
      return "Loading";
    } else {
      return "Download";
    }
  }
};

export default DownloadModal;
