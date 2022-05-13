import { isEmpty, pick } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { createStringToLocationFinder } from "src/common/utils/locationUtils";
import FilePicker from "src/components/FilePicker";
import ImportFileWarnings, {
  getAutocorrectCount,
  getDuplicatePrivateIds,
  getDuplicatePublicIds,
  getMissingFields,
} from "src/components/ImportFileWarnings";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "src/components/WebformTable/common/constants";
import {
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
import { FileUploadProps } from "../../index";
import { getMetadataEntryOrEmpty } from "../../utils";
import {
  parseFileEdit,
  ParseResult,
  SampleIdToWarningMessages,
} from "./parseFile";
import {
  getMissingMetadata,
  getNonEmptyUploadedMetadataFields,
  passOrDeleteEntry,
} from "./utils";

interface Props {
  metadata: SampleIdToEditMetadataWebform | null;
  changedMetadata: SampleIdToEditMetadataWebform | null;
  namedLocations: NamedGisaidLocation[];
  hasImportedMetadataFile: boolean;
  resetMetadataFromCheckedSamples(): void;
  onMetadataFileUploaded(props: FileUploadProps): void;
}

export default function ImportFile({
  metadata,
  namedLocations,
  hasImportedMetadataFile,
  changedMetadata,
  resetMetadataFromCheckedSamples,
  onMetadataFileUploaded,
}: Props): JSX.Element {
  const [missingFields, setMissingFields] = useState<string[] | null>(null);
  const [autocorrectCount, setAutocorrectCount] = useState<number>(0);
  const [filename, setFilename] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [extraneousSampleIds, setExtraneousSampleIds] = useState<string[]>([]);
  const [absentSampleIds, setAbsentSampleIds] = useState<string[]>([]);
  const [hasUnknownDataFields, setUnknownDataFields] = useState<boolean>(false);
  const [missingData, setMissingData] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [badFormatData, setBadFormatData] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [duplicatePrivateIds, setDuplicatePrivateIds] = useState<
    string[] | null
  >(null);
  const [duplicatePublicIds, setDuplicatePublicIds] = useState<string[] | null>(
    null
  );

  useEffect(() => {
    // If no file uploaded yet, do nothing.
    if (!parseResult) return;
    // If file was missing any col header fields, we parsed no data from it
    // and only display that error to the user to force them to fix problems.
    if (missingFields) return;

    const { data } = parseResult;
    const parseResultSampleIds = Object.keys(data);
    const sampleIds = Object.keys(metadata || EMPTY_OBJECT);

    const parseResultSampleIdsSet = new Set(parseResultSampleIds);
    const absentSampleIds = sampleIds.filter((sampleId) => {
      return !parseResultSampleIdsSet.has(sampleId);
    });
    setAbsentSampleIds(absentSampleIds);
  }, [parseResult, missingFields, metadata]);


  function clearState() {
    setFilename("");
    setExtraneousSampleIds([]);
    setAbsentSampleIds([]);
    setUnknownDataFields(false);
    setMissingData(EMPTY_OBJECT);
    setBadFormatData(EMPTY_OBJECT);
    setDuplicatePrivateIds(null);
    setDuplicatePublicIds(null);
    setAutocorrectCount(0);
    setMissingFields(null);
  };

  // Used by file upload parser to convert location strings to Locations
  const stringToLocationFinder = useMemo(() => {
    return createStringToLocationFinder(namedLocations);
  }, [namedLocations]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    // clear all metadata before importing tsv file
    resetMetadataFromCheckedSamples();
    clearState();

    const sampleIds = Object.keys(metadata || EMPTY_OBJECT);
    const sampleIdsSet = new Set(sampleIds);
    const result = await parseFileEdit(
      files[0],
      sampleIdsSet,
      stringToLocationFinder
    );

    const { warningMessages, filename, hasUnknownFields, extraneousSampleIds } =
      result;
    const missingFields = getMissingFields(result);
    const duplicatePrivateIds = getDuplicatePrivateIds(result);
    const duplicatePublicIds = getDuplicatePublicIds(result);
    setMissingFields(missingFields);
    setDuplicatePrivateIds(duplicatePrivateIds);
    setDuplicatePublicIds(duplicatePublicIds);
    // if any of the above errors are present we do not want to continue with upload
    if (
      missingFields ||
      !isEmpty(duplicatePrivateIds) ||
      !isEmpty(duplicatePublicIds)
    ) {
      return;
    }
    const autocorrectCount =
      getAutocorrectCount(warningMessages.get(WARNING_CODE.AUTO_CORRECT)) || 0;
    setExtraneousSampleIds(extraneousSampleIds);
    setAutocorrectCount(autocorrectCount);
    setFilename(filename);
    setParseResult(result);
    setBadFormatData(
      warningMessages.get(WARNING_CODE.BAD_FORMAT_DATA) || EMPTY_OBJECT
    );
    setUnknownDataFields(hasUnknownFields);
    handleMetadataFileUpload(result);
  };

  function handleMetadataFileUpload(result: ParseResult) {
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!metadata) return;

    const { data: sampleIdToUploadedMetadata, warningMessages } = result;

    const uploadedMetadata: SampleIdToEditMetadataWebform = {};
    const changedMetadataUpdated: SampleIdToEditMetadataWebform = {};
    for (const sampleId of Object.keys(metadata)) {
      // get current metadata and changed metadata entry for a sampleId
      const existingMetadataEntry = metadata[sampleId];

      const existingChangedMetadataEntry = getMetadataEntryOrEmpty(
        changedMetadata,
        sampleId
      );

      if (existingMetadataEntry) {
        const uploadedMetadataEntry = getMetadataEntryOrEmpty(
          sampleIdToUploadedMetadata,
          sampleId
        );

        // get all fields where user wants to update data
        const uploadedFieldsWithData = getNonEmptyUploadedMetadataFields(
          uploadedMetadataEntry
        );

        // check if any entries need to be deleted/ cleared (replace delete keyword with empty string)
        for (const [key, value] of Object.entries(uploadedMetadataEntry)) {
          (uploadedMetadataEntry[key as keyof SampleEditMetadataWebform] as
            | string
            | boolean
            | NamedGisaidLocation
            | undefined) = passOrDeleteEntry(value);
        }

        // only take uploaded metadata that the user wants changed, (empty strings are filled with existing metadata)
        const filledInUploadedMetadata = {
          ...pick(uploadedMetadataEntry, uploadedFieldsWithData),
        };

        if (!isEmpty(uploadedMetadataEntry)) {
          // check if there is any missing data that the user needs to fill in before proceeding
          setMissingData((prevMissingData) => {
            return getMissingMetadata(
              existingMetadataEntry,
              filledInUploadedMetadata,
              prevMissingData,
              sampleId
            );
          });
        }
        // merge uploaded metadata with changes from user, fill in blank fields with existing data
        uploadedMetadata[sampleId] = {
          ...existingMetadataEntry,
          ...filledInUploadedMetadata,
        };
        changedMetadataUpdated[sampleId] = {
          ...existingChangedMetadataEntry,
          ...filledInUploadedMetadata,
        };
      }
    }

    onMetadataFileUploaded({
      uploadedMetadata,
      changedMetadataUpdated,
      autocorrectWarnings:
        warningMessages.get(WARNING_CODE.AUTO_CORRECT) || EMPTY_OBJECT,
    });
  }

  return (
    <>
      <FilePicker
        handleFiles={handleFiles}
        text="Select Metadata File"
        accept=".tsv,.csv"
        shouldConfirm={hasImportedMetadataFile}
        confirmTitle="Are you sure you want to import new data?"
        confirmContent={
          "Your existing metadata will be replaced with the " +
          "information found in the new import file."
        }
      />
      <ImportFileWarnings
        hasImportedFile={hasImportedMetadataFile}
        extraneousSampleIds={extraneousSampleIds}
        parseResult={parseResult}
        filename={filename}
        missingFields={missingFields}
        autocorrectCount={autocorrectCount}
        absentSampleIds={absentSampleIds}
        missingData={missingData}
        duplicatePrivateIds={duplicatePrivateIds}
        duplicatePublicIds={duplicatePublicIds}
        hasUnknownDataFields={hasUnknownDataFields}
        badFormatData={badFormatData}
        IdColumnNameForWarnings={
          SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.privateId
        }
        metadataUploadType={MetadataUploadTypeOption.Edit}
      />
    </>
  );
}
