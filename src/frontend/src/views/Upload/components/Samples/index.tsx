import { Close } from "@material-ui/icons";
import { Button } from "czifui";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ROUTES } from "src/common/routes";
import AlertAccordion from "src/components/AlertAccordion";
import Progress from "../common/Progress";
import {
  ButtonWrapper,
  Content,
  Header,
  StyledInstructions,
  Subtitle,
  Title,
} from "../common/style";
import { ParseErrors, Props } from "../common/types";
import AlertTable from "./components/AlertTable";
import Table from "./components/Table";
import {
  ContentWrapper,
  SemiBold,
  StyledButton,
  StyledContainerLeft,
  StyledContainerSpaceBetween,
  StyledFilePicker,
  StyledInstructionsButton,
  StyledRemoveAllButton,
  StyledTitle,
  StyledUploadCount,
} from "./style";
import {
  getUploadCounts,
  handleFiles,
  hasSamples,
  removeSamplesFromTheSameFiles,
} from "./utils";

export default function Samples({ samples, setSamples }: Props): JSX.Element {
  const [parseErrors, setParseErrors] = useState<ParseErrors | null>(null);
  const [sampleCount, setSampleCount] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
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

  const handleInstructionsClick = () => {
    setShowInstructions(!showInstructions);
  };

  return (
    <>
      <Head>
        <title>Aspen | Upload Sample</title>
      </Head>
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
        <StyledContainerLeft>
          <StyledTitle>Select SARS-CoV-2 Consensus Genome Files</StyledTitle>
          <StyledInstructionsButton
            color="primary"
            onClick={handleInstructionsClick}
          >
            {showInstructions ? "LESS" : "MORE"} INFO
          </StyledInstructionsButton>
        </StyledContainerLeft>
        {showInstructions && (
          <StyledInstructions
            title="File instructions"
            items={[
              <span key="1">
                <SemiBold>
                  Do not include any PII in the Sample name or file name.
                </SemiBold>{" "}
                Your sample name should be the sample&apos;s Private ID.
              </span>,
              <span key="2">
                Accepted file formats: fasta (.fa or .fasta), fasta.gz (.fa.gz),
                fasta.zip
              </span>,
              <span key="3">
                File and sample names must be no longer than 120 characters and
                can only contain letters from the English alphabet (A-Z, upper
                and lower case), numbers (0-9), periods (.), hyphens (-),
                underscores (_), and backslashes (/). Spaces are not allowed.
              </span>,
              <span key="4">
                The maximum number of samples accommodated per upload is 500.
              </span>,
            ]}
          />
        )}
        <ContentWrapper>
          <StyledFilePicker
            text={isLoadingFile ? "Loading..." : "Select Fasta Files"}
            multiple
            handleFiles={handleFileChange}
            accept=".fasta,.fa,.gz,.zip"
            isDisabled={isLoadingFile}
          />
          {parseErrors && (
            <AlertAccordion
              severity="error"
              title="Some of your files or samples could not be imported."
              message={<AlertTable parseErrors={parseErrors} />}
            />
          )}
          {samples && (
            <>
              <StyledContainerSpaceBetween>
                <StyledUploadCount>
                  {fileCount} {fileCount > 1 ? "files" : "file"} imported, with{" "}
                  {sampleCount} {sampleCount > 1 ? "samples" : "sample"}{" "}
                  selected for upload
                </StyledUploadCount>
                <StyledRemoveAllButton
                  color="primary"
                  variant="text"
                  onClick={handleRemoveAllClick}
                  startIcon={<Close />}
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
                isRounded
                color="primary"
                variant="contained"
                disabled={!hasSamples(samples) || tooManySamples}
              >
                Continue
              </StyledButton>
            </a>
          </Link>
          <Link href={ROUTES.DATA_SAMPLES} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Cancel
              </Button>
            </a>
          </Link>
        </ButtonWrapper>
      </Content>
    </>
  );
}
