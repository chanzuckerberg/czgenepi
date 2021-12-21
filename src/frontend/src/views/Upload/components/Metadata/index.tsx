import { Button } from "czifui";
import { distance } from "fastest-levenshtein";
import NextLink from "next/link";
import React, { useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import { EMPTY_METADATA } from "src/views/Upload/components/common/constants";
import {
  NamedGisaidLocation,
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

function findLocationFromString(
  locationString: string,
  locations: NamedGisaidLocation[]
): NamedGisaidLocation {
  // compare levenshtein distances between location strings
  // for this implementation, we are comparing against the
  // Location.location - the narrowest scope (i.e. city/county level)
  // I would like to bias the final results towards a user's group's
  // location, but that will take some API modification.
  const scoredLocations: [NamedGisaidLocation, number][] = Object.values(
    locations
  ).map((location) => {
    if (location.location) {
      return [location, distance(location.location, locationString)];
    }
    return [location, 99];
  });
  const candidateLocation = scoredLocations.reduce(
    ([prevLocation, prevScore], [currLocation, currScore]) => {
      if (currScore < prevScore) {
        return [currLocation, currScore];
      }
      return [prevLocation, prevScore];
    }
  );
  return candidateLocation[0];
}

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

  function handleMetadataFileUpload(result: ParseResult) {
    const { data: sampleIdToParsedMetadata, warningMessages } = result;
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!samples) return;

    const uploadedMetadata: SampleIdToMetadata = {};

    // (thuang): Only extract metadata for existing samples
    for (const sampleId of Object.keys(samples)) {
      // get parsed metadata
      const parsedMetadata = sampleIdToParsedMetadata[sampleId];
      // try and match parsed collection location to a gisaid location
      const locationString = parsedMetadata.locationString || "";
      let collectionLocation = undefined;
      if (locationString.length > 2) {
        collectionLocation = findLocationFromString(
          locationString,
          namedLocations
        );
      }
      uploadedMetadata[sampleId] = {
        ...EMPTY_METADATA,
        ...parsedMetadata,
        collectionLocation,
      };
    }

    setMetadata(uploadedMetadata); // Set overarching metadata for samples
    // Additionally, track what the file's data was. Use this to blanket
    // (re-)initialize all the input fields to what was uploaded.
    setImportedFileMetadata(uploadedMetadata);

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
