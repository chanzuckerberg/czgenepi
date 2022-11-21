import { Alert, Icon, Link, Tooltip } from "czifui";
import { useCallback, useState } from "react";
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
import {
  CheckBoxInfo,
  CheckboxLabel,
  Container,
  Content,
  DownloadType,
  DownloadTypeInfo,
  Header,
  StyledCheckbox,
  StyledFileTypeItem,
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
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();
  const tooltipRef = useCallback((node: HTMLElement) => setAnchorEl(node), []);

  const [isFastaSelected, setFastaSelected] = useState<boolean>(false);
  const [isMetadataSelected, setMetadataSelected] = useState<boolean>(false);
  const [isGisaidSelected, setGisaidSelected] = useState<boolean>(false);
  const [isGenbankSelected, setGenbankSelected] = useState<boolean>(false);

  const completedSampleIds = checkedSamples.filter(
    (sample) => !failedSampleIds.includes(sample.id)
  );
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
              nCompletedSampleIds={nCompletedSampleIds}
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
