import { Button } from "czifui";
import { distance } from "fastest-levenshtein";
import Head from "next/head";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { getLocations, LocationsResponse } from "src/common/queries/locations";
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

export const EMPTY_METADATA: IMetadata = {
  collectionDate: "",
  collectionLocation: undefined,
  collectionLocationID: undefined,
  islAccessionNumber: "",
  keepPrivate: false,
  publicId: "",
  sequencingDate: "",
  submittedToGisaid: false,
};

function stringifyLocation(location: GisaidLocation): string {
  let stringName = "";
  const orderedKeys = ["region", "country", "division", "location"];
  orderedKeys.every((key) => {
    if (location[key]) {
      if (key != "region") {
        stringName += "/";
      }
      stringName += `${location[key]}`;
      return true;
    } else {
      return false;
    }
  });
  return stringName;
}

export default function Metadata({
  samples,
  metadata,
  setMetadata,
}: Props): JSX.Element {
  const [isValid, setIsValid] = useState(false);
  const [hasImportedFile, setHasImportedFile] = useState(false);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [locations, setLocations] = useState<GisaidLocation[]>([]);
  const [locationOptions, setLocationOptions] = useState<
    GisaidLocationOption[]
  >([]);

  const loadLocations = async () => {
    const result: LocationsResponse = await getLocations();
    setLocations(result.locations);
  };

  useEffect(() => {
    loadLocations();
  }, [samples]);

  useEffect(() => {
    const locationsToOptions: GisaidLocationOption[] = locations.map(
      (location) => {
        const stringName = stringifyLocation(location);
        return {
          name: stringName,
          description: "",
          id: location.id,
        };
      }
    );
    setLocationOptions(locationsToOptions);
  }, [locations]);

  function handleMetadata(result: ParseResult) {
    const { data: sampleIdToMetadata, warningMessages } = result;
    if (!samples) return;

    const newMetadata: SampleIdToMetadata = {};

    // (thuang): Only extract metadata for existing samples
    for (const sampleId of Object.keys(samples)) {
      // get parsed metadata
      newMetadata[sampleId] = sampleIdToMetadata[sampleId] || EMPTY_METADATA;
      // try and match parsed collection location to a gisaid location
      const collectionLocation = newMetadata[sampleId]?.collectionLocation;
      if (collectionLocation) {
        // compare levenshtein distances between location strings
        // for this implementation, we are comparing against the
        // Location.location - the narrowest scope (i.e. city/county level)
        // I would like to bias the final results towards a user's group's
        // location, but that will take some API modification.
        const scoredLocations: [GisaidLocation, number][] = locations.map(
          (location) => {
            if (location.location) {
              return [
                location,
                distance(location.location, collectionLocation),
              ];
            }
            return [location, 99];
          }
        );
        const candidateLocation = scoredLocations.reduce(
          ([prevLocation, prevScore], [currLocation, currScore]) => {
            if (currScore < prevScore) {
              return [currLocation, currScore];
            }
            return [prevLocation, prevScore];
          }
        );
        newMetadata[sampleId].collectionLocationID = candidateLocation[0].id;
      }
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
          locationOptions={locationOptions}
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
