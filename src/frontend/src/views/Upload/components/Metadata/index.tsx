import { Button } from "czifui";
import Head from "next/head";
import NextLink from "next/link";
import React, { useState, useEffect } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import {
  Metadata as IMetadata,
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
import { getLocations, LocationsResponse } from "src/common/queries/locations";

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
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [locations, setLocations] = useState<Location[]>([]);

  const loadLocations = async () => {
    const result: LocationsResponse = await getLocations();
    setLocations(result.locations);
  };

  useEffect(() => {
    loadLocations();
  }, []);

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
      warningMessages.get(WARNING_CODE.AUTO_CORRECT) || EMPTY_OBJECT
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
            `Samples are only available to anyone outside of your Group when it is shared by you, or by your Group. Other organizations that you share your data with (i.e. CDPH for California jurisdictions) can see your samples, but not your private, internal identifiers.`,
            `If a sample should remain private to your Group, please update the “Sample is Private” setting to “Yes”. These samples will never be shared beyond your Group unless you choose to change their access level later on.`,
            `Check local requirements for reporting to public health authorities. These may not be met by uploading samples to Aspen.`,
            <p key="1">
              Please read our{" "}
              <NewTabLink href={ROUTES.PRIVACY}>Privacy Policy</NewTabLink> for
              more information.
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
          locations={locations}
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
