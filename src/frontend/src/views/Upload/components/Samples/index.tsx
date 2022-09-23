import { Button, Icon } from "czifui";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HeadAppTitle } from "src/common/components";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { ROUTES } from "src/common/routes";
import AlertAccordion from "src/components/AlertAccordion";
import { CollapsibleInstructions } from "src/components/CollapsibleInstructions";
import Progress from "../common/Progress";
import {
  ButtonWrapper,
  Content,
  Header,
  Subtitle,
  Title,
} from "../common/style";
import { ParseErrors, Props } from "../common/types";
import AlertTable from "./components/AlertTable";
import Table from "./components/Table";
import { pathogenStrings } from "./strings";
import {
  ContentWrapper,
  SemiBold,
  StyledButton,
  StyledContainerSpaceBetween,
  StyledFilePicker,
  StyledRemoveAllButton,
  StyledUploadCount,
} from "./style";
import {
  getUploadCounts,
  handleFiles,
  hasSamples,
  removeSamplesFromTheSameFiles,
} from "./utils";

export default function Samples({ samples, setSamples }: Props): JSX.Element {
  const pathogen = useSelector(selectCurrentPathogen);
  const { header = "", acceptedFormats = "" } = pathogen
    ? pathogenStrings[pathogen]
    : {};

  const [parseErrors, setParseErrors] = useState<ParseErrors | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [tooManySamples, setTooManySamples] = useState(false);

  useEffect(() => {
    if (samples) {
      const counts = getUploadCounts(samples);
      setSampleCount(counts.sampleCount);
      setFileCount(counts.fileCount);
      setTooManySamples(Object.keys(samples).length > 500);
    }
  }, [samples]);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    setIsLoadingFile(true);

    const { result, errors } = await handleFiles(files);

    setIsLoadingFile(false);

    setSamples({
      ...removeSamplesFromTheSameFiles(samples, result),
      ...result,
    });

    if (Object.keys(errors).length === 0) return;

    setParseErrors(errors);
  };

  const handleRemoveAllClick = () => {
    setSamples(null);
    setParseErrors(null);
  };

  return (
    <>
      <HeadAppTitle subTitle="Upload Samples" />
      <Header>
        <div>
          <Title>Upload Samples</Title>
          <Subtitle>
            We&apos;ll start with selecting samples from your consensus genome
            files.
          </Subtitle>
        </div>
        <Progress step="1" />
      </Header>
      <Content>
        <CollapsibleInstructions
          buttonSize="xxs"
          header={header}
          headerSize="xl"
          instructionListTitle="File instructions"
          listPadding="xl"
          shouldStartOpen
          items={[
            <span key="1">
              <SemiBold>
                Do not include any PII in the Sample name or file name.
              </SemiBold>{" "}
              Your sample name should be the sample&apos;s Private ID.
            </span>,
            <span key="2">{acceptedFormats}</span>,
            <span key="3">
              Sample names must be no longer than 120 characters and can only
              contain letters from the English alphabet (A-Z, upper and lower
              case), numbers (0-9), periods (.), hyphens (-), underscores (_),
              spaces ( ), and forward slashes (/).
            </span>,
            <span key="4">
              The maximum number of samples accommodated per upload is 500.
            </span>,
          ]}
        />
        <ContentWrapper data-test-id="upload-select-sample-files-btn">
          <StyledFilePicker
            text={"Select Sample Files"}
            multiple
            handleFiles={handleFileChange}
            accept=".fasta,.fa,.txt,.gz,.zip"
            isLoading={isLoadingFile}
            data-test-id="sample-upload-select-files-btn"
          />
          {parseErrors && (
            <AlertAccordion
              intent="error"
              title="Some of your files or samples could not be imported."
              collapseContent={<AlertTable parseErrors={parseErrors} />}
              data-test-id="upload-import-error"
            />
          )}
          {samples && (
            <>
              <StyledContainerSpaceBetween>
                <StyledUploadCount data-test-id="sample-upload-file-count">
                  {fileCount} {fileCount > 1 ? "files" : "file"} imported, with{" "}
                  {sampleCount} {sampleCount > 1 ? "samples" : "sample"}{" "}
                  selected for upload
                </StyledUploadCount>
                <StyledRemoveAllButton
                  sdsType="primary"
                  sdsStyle="minimal"
                  onClick={handleRemoveAllClick}
                  startIcon={
                    <Icon sdsIcon="xMark" sdsSize="s" sdsType="static" />
                  }
                  data-test-id="sample-upload-remove-all-file-btn"
                >
                  REMOVE ALL
                </StyledRemoveAllButton>
              </StyledContainerSpaceBetween>

              <Table samples={samples} />
            </>
          )}
        </ContentWrapper>

        <ButtonWrapper>
          <Link href={ROUTES.UPLOAD_STEP2} passHref>
            <a href="passHref">
              <StyledButton
                sdsType="primary"
                sdsStyle="rounded"
                disabled={!hasSamples(samples) || tooManySamples}
                data-test-id="sample-upload-continue-btn"
              >
                Continue
              </StyledButton>
            </a>
          </Link>
          <Link href={ROUTES.DATA_SAMPLES} passHref>
            <a href="passHref">
              <Button
                sdsType="secondary"
                sdsStyle="rounded"
                data-test-id="sample-upload-cancel-btn"
              >
                Cancel
              </Button>
            </a>
          </Link>
        </ButtonWrapper>
      </Content>
    </>
  );
}
