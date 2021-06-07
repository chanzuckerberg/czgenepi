import { Button, Link } from "czifui";
import Head from "next/head";
import NextLink from "next/link";
import React, { useState } from "react";
import { EMPTY_ARRAY } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import {
  Metadata as IMetadata,
  Props,
  SampleIdToMetadata,
  WARNING_CODE,
} from "src/views/Upload/components/common/types";
import Progress from "../common/Progress";
import { Content, Header, Subtitle, Title } from "../common/style";
import ImportFile from "./components/ImportFile";
import { ParseResult } from "./components/ImportFile/parseFile";
import Table from "./components/Table";
import { ButtonWrapper, ContinueButton, StyledInstructions } from "./style";

export const EMPTY_METADATA: IMetadata = {
  collectionDate: "",
  collectionLocation: "",
  islAccessionNumber: "",
  keepPrivate: false,
  publicId: "",
  sequencingDate: "",
  submittedToGisaid: false,
};

export default function Metadata({
  samples,
  metadata,
  setMetadata,
}: Props): JSX.Element {
  const [isValid, setIsValid] = useState(false);
  const [hasImportedFile, setHasImportedFile] = useState(false);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<string[]>(EMPTY_ARRAY);

  function handleMetadata(result: ParseResult) {
    const { data: sampleIdToMetadata, warningMessages } = result;

    if (!samples) return;

    const newMetadata: SampleIdToMetadata = {};

    // (thuang): Only extract metadata for existing samples
    for (const sampleId of Object.keys(samples)) {
      newMetadata[sampleId] = sampleIdToMetadata[sampleId] || EMPTY_METADATA;
    }

    setMetadata(newMetadata);
    setAutocorrectWarnings(
      Array.from(warningMessages.get(WARNING_CODE.AUTO_CORRECT) || [])
    );
    setHasImportedFile(true);
  }

  return (
    <>
      <Head>
        <title>Aspen | Metadata and Sharing</title>
      </Head>
      <Header>
        <div>
          <Title>Metadata and Sharing</Title>
          <Subtitle>
            Add metadata to your samples by importing or updating the table
            below.
          </Subtitle>
        </div>
        <Progress step="2" />
      </Header>
      <Content>
        <StyledInstructions
          title="Sample Privacy & Sharing"
          items={[
            "By default, all samples are shared with the California Department of Health.",
            "Samples shared with CDPH on Aspen do not satisfy CDPH reporting requirements.",
            `If a sample should remain private to your County, please update the “Sample is Private” setting to “Yes”. Private samples will not be shared with CDPH through Aspen.`,
            <p key="1">
              Please read our{" "}
              <Link href={ROUTES.PRIVACY} target="_blank" rel="noopener">
                Privacy Policy
              </Link>{" "}
              for more information.
            </p>,
          ]}
        />

        <ImportFile samples={samples} handleMetadata={handleMetadata} />

        <Table
          hasImportedFile={hasImportedFile}
          setIsValid={setIsValid}
          metadata={metadata}
          setMetadata={setMetadata}
          autocorrectWarnings={autocorrectWarnings}
        />
        <ButtonWrapper>
          <NextStepWrapper isValid={isValid}>
            <ContinueButton
              disabled={!isValid}
              isRounded
              color="primary"
              variant="contained"
            >
              Continue
            </ContinueButton>
          </NextStepWrapper>
          <NextLink href={ROUTES.UPLOAD_STEP1} passHref>
            <a href="passHref">
              <Button isRounded color="primary" variant="outlined">
                Back
              </Button>
            </a>
          </NextLink>
        </ButtonWrapper>
      </Content>
    </>
  );
}

function NextStepWrapper({
  children,
  isValid,
}: {
  children: React.ReactNode;
  isValid: boolean;
}): JSX.Element {
  return isValid ? (
    <NextLink href={ROUTES.UPLOAD_STEP3} passHref>
      <a href="passHref">{children}</a>
    </NextLink>
  ) : (
    <>{children}</>
  );
}
