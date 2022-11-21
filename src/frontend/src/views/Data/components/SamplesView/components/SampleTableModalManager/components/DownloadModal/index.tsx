import { Alert, Icon, Link } from "czifui";
import { useState } from "react";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import Dialog from "src/components/Dialog";
import { DownloadButton } from "./components/DownloadButton";
import { DownloadMenuSelection } from "./components/DownloadMenuSelection";
import {
  Container,
  Content,
  DownloadType,
  DownloadTypeInfo,
  Header,
  Title,
  TooltipDescriptionText,
  TooltipHeaderText,
} from "./style";

interface Props {
  checkedSamples: Sample[];
  failedSampleIds: string[];
  open: boolean;
  onClose: () => void;
}

const DownloadModal = ({
  checkedSamples,
  failedSampleIds,
  open,
  onClose,
}: Props): JSX.Element => {
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isGisaidSelected, setGisaidSelected] = useState<boolean>(false);
  const [isGenbankSelected, setGenbankSelected] = useState<boolean>(false);

  const completedSampleIds = checkedSamples
    .filter((sample) => !failedSampleIds.includes(sample.publicId))
    .map((s) => s.publicId);

  const nCompletedSampleIds = completedSampleIds.length;
  const isFastaDisabled = nCompletedSampleIds === 0;

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
            {checkedSamples.length} {pluralize("Sample", checkedSamples.length)}{" "}
            Selected
          </Title>
        </DialogTitle>
        <DialogContent>
          <Content data-test-id="modal-content">
            <Container>
              <DownloadMenuSelection
                id="download-fasta-checkbox"
                isDisabled={isFastaDisabled}
                isChecked={isFastaSelected}
                onChange={handleFastaClick}
                downloadTitle="Consensus Genome"
                fileTypes=".fasta"
                tooltipTitle={FASTA_DISABLED_TOOLTIP_TEXT}
              >
                Download multiple consensus genomes in a single concatenated
                file.
              </DownloadMenuSelection>

              <DownloadMenuSelection
                id="download-metadata-checkbox"
                isChecked={isMetadataSelected}
                onChange={handleMetadataClick}
                downloadTitle="Sample Metadata"
                fileTypes=".tsv"
              >
                Sample metadata including Private and Public IDs, Collection
                Date, Sequencing Date, Lineage, GISAID Status, and ISL Accession
                #.
              </DownloadMenuSelection>

              <DownloadMenuSelection
                id="download-gisaid-checkbox"
                isChecked={isGisaidSelected}
                onChange={handleGisaidClick}
                downloadTitle="GISAID Submission Template"
                fileTypes=".fasta, .tsv"
              >
                Download concatenated consensus genomes and metadata files
                formatted to prepare samples for submission to GISAID.{" "}
                <Link
                  href="https://help.czgenepi.org/hc/en-us/articles/8179880474260"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More.
                </Link>
              </DownloadMenuSelection>

              <DownloadMenuSelection
                id="download-genbank-checkbox"
                isChecked={isGenbankSelected}
                onChange={handleGenbankClick}
                downloadTitle="Genbank Submission Template"
                fileTypes=".fasta, .tsv"
              >
                Download concatenated consensus genomes and metadata files
                formatted to prepare samples for submission to Genbank.{" "}
                <Link
                  href="https://help.czgenepi.org/hc/en-us/articles/8179961027604"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More.
                </Link>
              </DownloadMenuSelection>
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
            <DownloadButton
              checkedSamples={checkedSamples}
              isFastaSelected={isFastaSelected}
              isGenbankSelected={isGenbankSelected}
              isGisaidSelected={isGisaidSelected}
              isMetadataSelected={isMetadataSelected}
              completedSampleIds={completedSampleIds}
              handleCloseModal={handleCloseModal}
            />
          </Content>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
};

export default DownloadModal;
