import { useTreatments } from "@splitsoftware/splitio-react";
import { Button, Link } from "czifui";
import NextLink from "next/link";
import { useCallback, useMemo, useState } from "react";
import { HeadAppTitle } from "src/common/components";
import { setApplyAllValueToPrevMetadata } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/utils";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { ROUTES } from "src/common/routes";
import { createStringToLocationFinder } from "src/common/utils/locationUtils";
import { isUserFlagOn } from "src/components/Split";
import { USER_FEATURE_FLAGS } from "src/components/Split/types";
import { WebformTable } from "src/components/WebformTable";
import {
  Metadata as MetadataType,
  SampleIdToMetadata,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
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
import { Props } from "../common/types";
import { initSampleMetadata } from "../common/utils";
import ImportFile from "./components/ImportFile";
import StaticTable from "./components/StaticTable";
import {
  ParseResult,
  SampleIdToWarningMessages,
} from "./components/ImportFile/parseFile";

export default function Metadata({
  samples,
  namedLocations,
  metadata,
  setMetadata,
}: Props): JSX.Element {
  const [isValid, setIsValid] = useState(false);
  const [hasImportedMetadataFile, setHasImportedMetadataFile] =
    useState<boolean>(false);
  const [autocorrectWarnings, setAutocorrectWarnings] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);

  // Used for displaying a static metadata table
  const flag = useTreatments([USER_FEATURE_FLAGS.static_metadata_table]);
  const isStaticMetadataTableFlagOn = isUserFlagOn(
    flag,
    USER_FEATURE_FLAGS.static_metadata_table
  );

  let numberOfDetectedSamples = 0
  if (samples != null) {
    numberOfDetectedSamples = Object.keys(samples).length
  }

  let useStaticMetadataTable = false
  if (numberOfDetectedSamples >= 100 && isStaticMetadataTableFlagOn) {
    useStaticMetadataTable = true
  }

  // Used by file upload parser to convert location strings to Locations
  const stringToLocationFinder = useMemo(() => {
    return createStringToLocationFinder(namedLocations);
  }, [namedLocations]);

  const handleRowMetadata_ = (id: string, sampleMetadata: MetadataType) => {
    setMetadata((prevMetadata) => {
      return { ...prevMetadata, [id]: sampleMetadata };
    });
  };

  const handleRowMetadata = useCallback(handleRowMetadata_, [setMetadata]);

  // TODO: update value type to be something other than unknown
  const applyToAllColumn_ = (fieldKey: keyof MetadataType, value: unknown) => {
    setMetadata((prevMetadata) => {
      return setApplyAllValueToPrevMetadata(prevMetadata, fieldKey, value);
    });
  };

  const applyToAllColumn = useCallback(applyToAllColumn_, [setMetadata]);

  function handleMetadataFileUpload(result: ParseResult) {
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!samples) return;

    const { data: sampleIdToUploadedMetadata, warningMessages } = result;

    // Filter out any metadata for samples they did not just upload
    // Note: Might be cleaner to do this filtering inside of file parse call,
    // but would require changing the way some of the warnings work currently.
    const uploadedMetadata: SampleIdToMetadata = {};
    for (const sampleId of Object.keys(samples)) {
      if (sampleIdToUploadedMetadata[sampleId]) {
        uploadedMetadata[sampleId] = sampleIdToUploadedMetadata[sampleId];
      } else {
        // If they did not provide metadata for a given sample, ensure that it
        // has a sane default so it can be entered later and not dropped.
        // FIXME (Vince): This winds up destroying any data the user might have
        // previously entered for the sample via web form. It's not great, but
        // it was pre-existing behavior and I don't have time to fix it right
        // now because it would involve restructuring how we default metadata
        uploadedMetadata[sampleId] = initSampleMetadata(sampleId);
      }
    }

    setMetadata(uploadedMetadata);
    setHasImportedMetadataFile(true);

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

        {useStaticMetadataTable && <StaticTable metadata={metadata} setIsValid={setIsValid}/>}

        {!useStaticMetadataTable && <WebformTable
          setIsValid={setIsValid}
          metadata={metadata}
          hasImportedMetadataFile={hasImportedMetadataFile}
          setMetadata={setMetadata}
          autocorrectWarnings={autocorrectWarnings}
          locations={namedLocations}
          applyToAllColumn={applyToAllColumn}
          handleRowMetadata={handleRowMetadata}
          webformTableType="UPLOAD"
        />}

        <ButtonWrapper>
          <NextStepWrapper isValid={isValid}>
            <ContinueButton
              disabled={!isValid}
              sdsType="primary"
              sdsStyle="rounded"
              data-test-id="upload-step-two-continue-btn"
            >
              Continue
            </ContinueButton>
          </NextStepWrapper>
          <NextLink href={ROUTES.UPLOAD_STEP1} passHref>
            <Link href="passHref">
              <Button
                sdsType="secondary"
                sdsStyle="rounded"
                data-test-id="upload-step-two-back-btn"
              >
                Back
              </Button>
            </Link>
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
    <NextLink
      href={ROUTES.UPLOAD_STEP3}
      passHref
      data-test-id="upload-step-counter"
    >
      <Link href="passHref">{children}</Link>
    </NextLink>
  ) : (
    <>{children}</>
  );
}
