import { Alert, Icon, Link } from "czifui";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DialogActions from "src/common/components/library/Dialog/components/DialogActions";
import DialogContent from "src/common/components/library/Dialog/components/DialogContent";
import DialogTitle from "src/common/components/library/Dialog/components/DialogTitle";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { Pathogen } from "src/common/redux/types";
import {
  StyledCloseIconButton,
  StyledCloseIconWrapper,
} from "src/common/styles/iconStyle";
import { pluralize } from "src/common/utils/strUtils";
import Dialog from "src/components/Dialog";
import { DownloadButton } from "./components/DownloadButton";
import { DownloadMenuSelection } from "./components/DownloadMenuSelection";
import {
  AlertBody,
  AlertStrong,
  Container,
  Content,
  Header,
  StyledCallout,
  Title,
  TooltipDescriptionText,
  TooltipHeaderText,
} from "./style";

interface Props {
  checkedSamples: Sample[];
  open: boolean;
  onClose: () => void;
}

const DownloadModal = ({
  checkedSamples,
  open,
  onClose,
}: Props): JSX.Element => {
  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isGisaidSelected, setGisaidSelected] = useState<boolean>(false);
  const [isGenbankSelected, setGenbankSelected] = useState<boolean>(false);
  const [isNextcladeDataSelected, setNextcladeDataSelected] = useState(false);
  const [noQCDataSampleIds, setNoQCDataSampleIds] = useState<string[]>([]);

  const pathogen = useSelector(selectCurrentPathogen);
  const isGisaidTemplateEnabled = pathogen === Pathogen.COVID;

  useEffect(() => {
    const noQCIds = checkedSamples
      // for now samples should only have one qcMetrics entry
      .filter((s) => s.qcMetrics[0].qcStatus === "Processing")
      .map((s) => s.publicId);
    setNoQCDataSampleIds(noQCIds);
  }, [checkedSamples]);

  const completedSampleIds = checkedSamples.map((s) => s.publicId);

  // only pass samples that have associated qc data to nextclade download
  const sampleIdsWQCData = checkedSamples
    .filter((sample) => !noQCDataSampleIds.includes(sample.publicId))
    .map((s) => s.publicId);

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

  const handleNextcladeDataClick = function () {
    setNextcladeDataSelected(!isNextcladeDataSelected);
  };

  const handleCloseModal = () => {
    setFastaSelected(false);
    setMetadataSelected(false);
    setGenbankSelected(false);
    setGisaidSelected(false);
    setNextcladeDataSelected(false);
    onClose();
  };

  const NO_NEXTCLADE_DATA_TOOLTIP_TEXT = (
    <div>
      <TooltipHeaderText>No QC data available for download.</TooltipHeaderText>
      <TooltipDescriptionText>
        Select at least 1 sample with a QC Status of good, mediocre, bad, or
        failed to proceed.
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
                isChecked={isFastaSelected}
                onChange={handleFastaClick}
                downloadTitle="Consensus Genome"
                fileTypes=".fasta"
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
                id="download-nextclade-checkbox"
                isChecked={isNextcladeDataSelected}
                isDisabled={noQCDataSampleIds.length === checkedSamples.length}
                tooltipTitle={NO_NEXTCLADE_DATA_TOOLTIP_TEXT}
                onChange={handleNextcladeDataClick}
                downloadTitle="Sample Mutations and QC Metrics"
                fileTypes=".tsv"
              >
                Download a list of nucelotide and protein mutations and QC
                metrics for the selected samples.{" "}
                <NewTabLink
                  href={
                    "https://help.czgenepi.org/hc/en-us/articles/11569567939604-Download-QC-Metrics-and-Mutation-Data"
                  }
                >
                  Learn more
                </NewTabLink>
              </DownloadMenuSelection>
              {isGisaidTemplateEnabled && (
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
              )}
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
            {isGisaidSelected && checkedSamples.length > 1000 && (
              <StyledCallout intent="warning">
                The number of samples selected exceeds GISAID’s upload limit of
                1000 samples. To avoid an error while submitting to GISIAD, we
                recommend splitting your download into smaller batches.
              </StyledCallout>
            )}
            {isNextcladeDataSelected && noQCDataSampleIds.length > 0 && (
              <Alert severity="warning">
                <AlertStrong>
                  {noQCDataSampleIds.length}{" "}
                  {pluralize("sample", noQCDataSampleIds.length)} will not be
                  included in your QC Metrics download
                </AlertStrong>{" "}
                <AlertBody>
                  because {pluralize("it", noQCDataSampleIds.length)}{" "}
                  {pluralize("does", noQCDataSampleIds.length)} not have QC data
                  available yet. These samples will still be included in other
                  selected downloads.
                </AlertBody>
              </Alert>
            )}
            <DownloadButton
              checkedSamples={checkedSamples}
              sampleIdsWQCData={sampleIdsWQCData}
              isFastaSelected={isFastaSelected}
              isGenbankSelected={isGenbankSelected}
              isGisaidSelected={isGisaidSelected}
              isMetadataSelected={isMetadataSelected}
              isNextcladeDataSelected={isNextcladeDataSelected}
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
