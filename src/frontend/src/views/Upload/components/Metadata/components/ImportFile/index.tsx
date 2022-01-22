import { Button } from "czifui";
import { isEmpty } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import FilePicker from "src/components/FilePicker";
import {
  ERROR_CODE,
  Props as CommonProps,
  WARNING_CODE,
} from "src/views/Upload/components/common/types";
import Error from "./components/Alerts/Error";
import Success from "./components/Alerts/Success";
import {
  WarningAbsentSample,
  WarningAutoCorrect,
  WarningExtraneousEntry,
  WarningMissingData,
} from "./components/Alerts/warnings";
import DownloadTemplate from "./components/DownloadTemplate";
import Instructions from "./components/Instructions";
import { parseFile, ParseResult, SampleIdToWarningMessages } from "./parseFile";
import { prepMetadataTemplate } from "./prepMetadataTemplate";
import { IntroWrapper, Title, TitleWrapper, Wrapper } from "./style";

interface Props {
  handleMetadata: (result: ParseResult) => void;
  samples: CommonProps["samples"];
  stringToLocationFinder: StringToLocationFinder;
}

export default function ImportFile({
  handleMetadata,
  samples,
  stringToLocationFinder,
}: Props): JSX.Element {
  const [isInstructionsShown, setIsInstructionsShown] = useState(false);
  const [hasImportedFile, setHasImportedFile] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [autocorrectCount, setAutocorrectCount] = useState<number>(0);
  const [filename, setFilename] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [extraneousSampleIds, setExtraneousSampleIds] = useState<string[]>([]);
  const [absentSampleIds, setAbsentSampleIds] = useState<string[]>([]);
  const [missingData, setMissingData] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);

  // Determine mismatches between uploaded metadata IDs and previous step's IDs.
  // `extraneousSampleIds` are what was in metadata, but not in sequence upload
  // `absentSampleIds` were in sequence upload, but missing from metadata
  useEffect(() => {
    if (!parseResult) return;

    const { data } = parseResult;
    const parseResultSampleIds = Object.keys(data);
    const sampleIds = Object.keys(samples || EMPTY_OBJECT);

    const sampleIdsSet = new Set(sampleIds);
    const extraneousSampleIds = parseResultSampleIds.filter((parseId) => {
      return !sampleIdsSet.has(parseId);
    });
    setExtraneousSampleIds(extraneousSampleIds);

    const parseResultSampleIdsSet = new Set(parseResultSampleIds);
    const absentSampleIds = sampleIds.filter((sampleId) => {
      return !parseResultSampleIdsSet.has(sampleId);
    });
    setAbsentSampleIds(absentSampleIds);
  }, [parseResult, samples]);

  const handleInstructionsClick = () => {
    setIsInstructionsShown(!isInstructionsShown);
  };

  const { templateHeaders, templateRows } = useMemo(() => {
    return prepMetadataTemplate(Object.keys(samples || EMPTY_OBJECT));
  }, [samples]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const result = await parseFile(files[0], stringToLocationFinder);

    const { errorMessages, warningMessages, filename } = result;

    const missingFields = Array.from(
      errorMessages.get(ERROR_CODE.MISSING_FIELD) || []
    );

    const autocorrectCount =
      getAutocorrectCount(warningMessages.get(WARNING_CODE.AUTO_CORRECT)) || 0;

    setHasImportedFile(true);
    setMissingFields(missingFields);
    setAutocorrectCount(autocorrectCount);
    setFilename(filename);
    setParseResult(result);
    setMissingData(
      warningMessages.get(WARNING_CODE.MISSING_DATA) || EMPTY_OBJECT
    );

    handleMetadata(result);
  };

  return (
    <Wrapper>
      <IntroWrapper>
        <TitleWrapper>
          <Title>Import Data from a TSV file</Title>
          <Button color="primary" onClick={handleInstructionsClick}>
            {isInstructionsShown ? "HIDE" : "SHOW"} INSTRUCTIONS
          </Button>
          <DownloadTemplate headers={templateHeaders} rows={templateRows}>
            <Button color="primary">Download Metadata Template (TSV)</Button>
          </DownloadTemplate>
        </TitleWrapper>

        {isInstructionsShown && (
          <Instructions headers={templateHeaders} rows={templateRows} />
        )}
      </IntroWrapper>

      <div>
        <FilePicker
          handleFiles={handleFiles}
          text="Select Metadata File"
          accept=".tsv"
          shouldConfirm={hasImportedFile}
          confirmTitle="Are you sure you want to import new data?"
          confirmContent={
            "Your existing metadata will be replaced with the " +
            "information found in the new import file."
          }
        />
      </div>

      <RenderOrNull
        condition={
          hasImportedFile &&
          !getIsParseResultCompletelyUnused(extraneousSampleIds, parseResult)
        }
      >
        <Success filename={filename} />
      </RenderOrNull>

      <RenderOrNull condition={missingFields.length}>
        <Error errorCode={ERROR_CODE.MISSING_FIELD} names={missingFields} />
      </RenderOrNull>

      <RenderOrNull condition={autocorrectCount}>
        <WarningAutoCorrect autocorrectedSamplesCount={autocorrectCount} />
      </RenderOrNull>

      <RenderOrNull condition={extraneousSampleIds.length}>
        <WarningExtraneousEntry extraneousSampleIds={extraneousSampleIds} />
      </RenderOrNull>

      <RenderOrNull condition={absentSampleIds.length}>
        <WarningAbsentSample absentSampleIds={absentSampleIds} />
      </RenderOrNull>

      <RenderOrNull condition={!isEmpty(missingData)}>
        <WarningMissingData missingData={missingData} />
      </RenderOrNull>
    </Wrapper>
  );
}

function RenderOrNull({
  condition,
  children,
}: {
  condition: unknown;
  children: React.ReactNode;
}): JSX.Element | null {
  if (!condition) return null;

  return <>{children}</>;
}

function getIsParseResultCompletelyUnused(
  extraneousSampleIds: string[],
  parseResult: ParseResult | null
) {
  if (!parseResult) return true;

  const { data } = parseResult;

  return extraneousSampleIds.length === Object.keys(data).length;
}

function getAutocorrectCount(
  sampleIdToWarningMessages: SampleIdToWarningMessages = {}
) {
  return Object.keys(sampleIdToWarningMessages).length;
}
