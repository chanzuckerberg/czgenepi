import React, { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
import { ParseResult as ParseResultEdit } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
=======
import {
  ParseResult as ParseResultEdit,
  SampleIdToWarningMessages as SampleIdToWarningMessagesEdit,
} from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
>>>>>>> 5b598541 (allow user to import tsv data for sample edit)
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import { SampleUploadDownloadTemplate } from "src/components/DownloadMetadataTemplate";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import {
  prepUploadMetadataTemplate,
  TEMPLATE_UPDATED_DATE,
} from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
import FilePicker from "src/components/FilePicker";
<<<<<<< HEAD
import ImportFileWarnings, {
  getAutocorrectCount,
  getMissingFields,
} from "src/components/ImportFileWarnings";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { WARNING_CODE } from "src/components/WebformTable/common/types";
=======
import ImportFileWarnings from "src/components/ImportFileWarnings";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import {
  ERROR_CODE,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
>>>>>>> 5b598541 (allow user to import tsv data for sample edit)
import { Props as CommonProps } from "src/views/Upload/components/common/types";
import Instructions from "./components/Instructions";
import {
  parseFile,
  ParseResult as ParseResultUpload,
  SampleIdToWarningMessages as SampleIdToWarningMessagesUpload,
} from "./parseFile";
import {
  IntroWrapper,
  StyledButton,
  StyledUpdatedDate,
  Title,
  TitleWrapper,
  Wrapper,
} from "./style";
interface Props {
  handleMetadata: (result: ParseResultUpload) => void;
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
  const [missingFields, setMissingFields] = useState<string[] | null>(null);
  const [autocorrectCount, setAutocorrectCount] = useState<number>(0);
  const [filename, setFilename] = useState("");
  const [parseResult, setParseResult] = useState<
    ParseResultUpload | ParseResultEdit | null
  >(null);
  const [extraneousSampleIds, setExtraneousSampleIds] = useState<string[]>([]);
  const [absentSampleIds, setAbsentSampleIds] = useState<string[]>([]);
  const [missingData, setMissingData] =
    useState<SampleIdToWarningMessagesUpload>(EMPTY_OBJECT);
  const [badFormatData, setBadFormatData] =
    useState<SampleIdToWarningMessagesUpload>(EMPTY_OBJECT);

  // Determine mismatches between uploaded metadata IDs and previous step's IDs.
  // `extraneousSampleIds` are what was in metadata, but not in sequence upload
  // `absentSampleIds` were in sequence upload, but missing from metadata
  useEffect(() => {
    // If no file uploaded yet, do nothing.
    if (!parseResult) return;
    // If file was missing any col header fields, we parsed no data from it
    // and only display that error to the user to force them to fix problems.
    if (getMissingFields(parseResult)) return;

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
    return prepUploadMetadataTemplate(Object.keys(samples || EMPTY_OBJECT));
  }, [samples]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const result = await parseFile(files[0], stringToLocationFinder);

    const { warningMessages, filename } = result;
    const missingFields = getMissingFields(result);
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
    setBadFormatData(
      warningMessages.get(WARNING_CODE.BAD_FORMAT_DATA) || EMPTY_OBJECT
    );

    handleMetadata(result);
  };

  return (
    <Wrapper>
      <IntroWrapper>
        <TitleWrapper>
          <Title>Import Data from a TSV or CSV file</Title>
          <StyledButton
            sdsType="secondary"
            sdsStyle="minimal"
            onClick={handleInstructionsClick}
          >
            {isInstructionsShown ? "HIDE" : "SHOW"} INSTRUCTIONS
          </StyledButton>
          <SampleUploadDownloadTemplate
            headers={templateHeaders}
            rows={templateRows}
          >
            <StyledButton sdsType="secondary" sdsStyle="minimal">
              Download Metadata Template (TSV)
            </StyledButton>
          </SampleUploadDownloadTemplate>
          <StyledUpdatedDate>Updated {TEMPLATE_UPDATED_DATE}</StyledUpdatedDate>
        </TitleWrapper>

        {isInstructionsShown && (
          <Instructions headers={templateHeaders} rows={templateRows} />
        )}
      </IntroWrapper>

      <div>
        <FilePicker
          handleFiles={handleFiles}
          text="Select Metadata File"
          accept=".tsv,.csv"
          shouldConfirm={hasImportedFile}
          confirmTitle="Are you sure you want to import new data?"
          confirmContent={
            "Your existing metadata will be replaced with the " +
            "information found in the new import file."
          }
        />
      </div>

      <ImportFileWarnings
        hasImportedFile={hasImportedFile}
        extraneousSampleIds={extraneousSampleIds}
        parseResult={parseResult}
        filename={filename}
        missingFields={missingFields}
        autocorrectCount={autocorrectCount}
        absentSampleIds={absentSampleIds}
        missingData={missingData}
        badFormatData={badFormatData}
        IdColumnNameForWarnings={
          SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId
        }
        metadataUploadType={MetadataUploadTypeOption.Upload}
      />
    </Wrapper>
  );
}
