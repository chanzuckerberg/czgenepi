import { Button } from "czifui";
import NextLink from "next/link";
import React, { useState, useMemo } from "react";
import { HeadAppTitle } from "src/common/components";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import { createStringToLocationFinder } from "src/common/utils/locationUtils";
import {
  Props,
  SampleIdToMetadata,
  WARNING_CODE,
} from "src/views/Upload/components/common/types";
import Progress from "../common/Progress";
import {
  ButtonWrapper,
  Content,
  ContinueButton,
  Header,
  StyledInstructions,
  Subtitle,
  Title,
} from "../common/style";
import ImportFile from "./components/ImportFile";
import {
  ParseResult,
  SampleIdToWarningMessages,
} from "./components/ImportFile/parseFile";
import Table from "./components/Table";


export default function Metadata({
  samples,
  namedLocations,
  metadata,
  setMetadata,
}: Props): JSX.Element {
  const [isValid, setIsValid] = useState(false);
  const [importedFileMetadata, setImportedFileMetadata] =
    useState<SampleIdToMetadata | null>(null);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);

  // Used by file upload parser to convert location strings to Locations
  const stringToLocationFinder = useMemo(() => {
    return createStringToLocationFinder(namedLocations);
  }, [namedLocations]);

  function handleMetadataFileUpload(result: ParseResult) {
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!samples) return;

    const { data: sampleIdToUploadedMetadata, warningMessages } = result;

    // Filter out any metadata for samples they did not just upload
    // Note: Might be cleaner to do this filtering inside of file parse call,
    // but would require changing the way some of the warnings work currently.
    const uploadedSamplesMetadata: SampleIdToMetadata = {};
    for (const sampleId of Object.keys(samples)) {
      if (sampleIdToUploadedMetadata[sampleId]) {
        uploadedSamplesMetadata[sampleId] = sampleIdToUploadedMetadata[sampleId];
      }
    }

    setMetadata(uploadedSamplesMetadata); // Set overarching metadata for samples
    // Additionally, track what the file's data was. Use this to blanket
    // (re-)initialize all the input fields to what was uploaded.
    setImportedFileMetadata(uploadedSamplesMetadata);

    setAutocorrectWarnings(
      warningMessages.get(WARNING_CODE.AUTO_CORRECT) || EMPTY_OBJECT
    );
  }

  return (
    <>
      <HeadAppTitle subTitle="Metadata and Sharing" />
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
            `Samples are only available to anyone outside of your Group when it is shared by you, or by your Group. Other organizations that you share your data with (i.e. CDPH for California jurisdictions) can see your samples, but not your private, internal identifiers.`,
            `If a sample should remain private to your Group, please update the “Sample is Private” setting to “Yes”. These samples will never be shared beyond your Group unless you choose to change their access level later on.`,
            `Check local requirements for reporting to public health authorities. These may not be met by uploading samples to CZ GEN EPI.`,
            <p key="1">
              Please read our{" "}
              <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink> for
              more information.
            </p>,
          ]}
        />

        <ImportFile
          samples={samples}
          handleMetadata={handleMetadataFileUpload}
          stringToLocationFinder={stringToLocationFinder}
        />

        <Table
          setIsValid={setIsValid}
          metadata={metadata}
          importedFileMetadata={importedFileMetadata}
          setMetadata={setMetadata}
          autocorrectWarnings={autocorrectWarnings}
          locations={namedLocations}
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
