import { Dialog } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { Alert } from "czifui";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { useMutation } from "react-query";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { useUserInfo } from "src/common/queries/auth";
import { downloadSamplesFasta } from "src/common/queries/samples";
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
  Title,
} from "./style";

interface Props {
  sampleIds: string[];
  failedSamples: any[];
  tsvData: [string[], string[][]] | undefined;
  open: boolean;
  onClose: () => void;
  setDownloadFailed: (hasFailed: boolean) => void;
}

const DownloadModal = ({
  sampleIds,
  failedSamples,
  tsvData,
  open,
  onClose,
  setDownloadFailed,
}: Props): JSX.Element => {
  const { data } = useUserInfo();
  const groupName = data?.group?.name.toLowerCase().replace(/ /g, "_"); // format group name for sequences download file
  const downloadDate = new Date();
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isFastaDisabled, setFastaDisabled] = useState<boolean>(false);
  const [tsvRows, setTsvRows] = useState<string[][]>([]);
  const [tsvHeaders, setTsvHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (tsvData) {
      const [Headers, Rows] = tsvData;
      setTsvHeaders(Headers);
      setTsvRows(Rows);
    }
  }, [tsvData]);

  const separator = "\t";

  useEffect(() => {
    if (JSON.stringify(sampleIds) === JSON.stringify(failedSamples)) {
      setFastaDisabled(true);
    } else {
      setFastaDisabled(false);
    }
  }, [sampleIds, failedSamples]);

  const handleMetadataClick = function () {
    setMetadataSelected((prevState: boolean) => !prevState);
  };

  const handleFastaClick = function () {
    setFastaSelected((prevState: boolean) => !prevState);
  };

  const mutation = useMutation(downloadSamplesFasta, {
    onError: () => {
      setDownloadFailed(true);
    },
    onSuccess: (data: any) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(data);
      link.download = `${groupName}_sample_sequences_${downloadDate.toISOString().slice(0, 10)}.fasta`;
      link.click();
      onClose();
      // reset all selection data
      setMetadataSelected(false);
      setFastaSelected(false);
    },
  });

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
        <Header>Download Samples</Header>
        <Title>
          {sampleIds.length} Sample{sampleIds.length > 1 && "s"} Selected
        </Title>
      </DialogTitle>
      <DialogContent>
        <Content data-test-id="modal-content">
          <Container>
            <CheckBoxWrapper style={getBackgroundFastaColor()}>
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
                (consensus.fa)
                <DownloadTypeInfo>
                  Download multiple consensus genomes in a single, concatenated
                  file
                </DownloadTypeInfo>
              </CheckBoxInfo>
            </CheckBoxWrapper>
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
      return { color: "#999999" };
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
    if (isMetadataSelected && !isFastaSelected) {
      return (
        <CSVLink
          data={tsvRows}
          headers={tsvHeaders}
          filename="samples_overview.tsv"
          separator={separator}
          data-test-id="download-tsv-link"
        >
          <StyledButton
            color="primary"
            variant="contained"
            isRounded
            disabled={false}
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
          filename="samples_overview.tsv"
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
