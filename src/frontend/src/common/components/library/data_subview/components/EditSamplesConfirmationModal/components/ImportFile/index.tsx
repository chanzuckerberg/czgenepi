import { pick } from "lodash";
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
import { warnMissingMetadata } from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import {
  parseFileEdit,
  ParseResult,
  SampleIdToWarningMessages,
} from "./parseFile";

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
  }, [parseResult, metadata, missingFields]);

  // Used by file upload parser to convert location strings to Locations
  const stringToLocationFinder = useMemo(() => {
    return createStringToLocationFinder(namedLocations);
  }, [namedLocations]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    // start
    const sampleIds = Object.keys(metadata || EMPTY_OBJECT);
    const sampleIdsSet = new Set(sampleIds);
    // end
    const result = await parseFileEdit(
      files[0],
      sampleIdsSet,
      stringToLocationFinder
    );

    const { warningMessages, filename, hasUnknownFields, extraneousSampleIds } = result;
    const missingFields = getMissingFields(result);
    const duplicatePrivateIds = getDuplicatePrivateIds(result);
    const duplicatePublicIds = getDuplicatePublicIds(result);
    const autocorrectCount =
      getAutocorrectCount(warningMessages.get(WARNING_CODE.AUTO_CORRECT)) || 0;
    setExtraneousSampleIds(extraneousSampleIds);
    setMissingFields(missingFields);
    setDuplicatePrivateIds(duplicatePrivateIds);
    setDuplicatePublicIds(duplicatePublicIds);
    setAutocorrectCount(autocorrectCount);
    setFilename(filename);
    setParseResult(result);
    setBadFormatData(
      warningMessages.get(WARNING_CODE.BAD_FORMAT_DATA) || EMPTY_OBJECT
    );
    setUnknownDataFields(hasUnknownFields);
    handleMetadataFileUpload(result);
  };

  // we need to decide if a user wants to delete a sample (if they provide a delete keyword in the cell)
  // if no delete keyword is detected, return the existing value, else return "".
  function passOrDeleteEntry(
    value: string | boolean | NamedGisaidLocation
  ): string | boolean | NamedGisaidLocation | undefined {
    if (value && value.toString().toLowerCase() === "delete") {
      return "";
    }
    return value;
  }

  function handleMetadataFileUpload(result: ParseResult) {
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!metadata) return;

    // clear all metadata before importing tsv file
    resetMetadataFromCheckedSamples();

    const { data: sampleIdToUploadedMetadata, warningMessages } = result;
    const missingData = {};

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

        // get metadata entries from upload that are not empty (means user wants to import new data)
        const uploadedFieldsWithData: string[] = [];
        // TODO: replace with a filter call instead
        Object.keys(uploadedMetadataEntry).forEach(function (item) {
          const uploadedEntry =
            uploadedMetadataEntry[item as keyof SampleEditMetadataWebform];
          if (uploadedEntry !== "" && uploadedEntry !== undefined)
            uploadedFieldsWithData.push(item);
        });

        // check if any entries need to be deleted/ cleared
        for (const [key, value] of Object.entries(uploadedMetadataEntry)) {
          (uploadedMetadataEntry[key as keyof SampleEditMetadataWebform] as
            | string
            | boolean
            | NamedGisaidLocation
            | undefined) = passOrDeleteEntry(value);
        }
        setMissingData((prevMissingData) => {
          const rowMissingMetadataWarnings = warnMissingMetadata(
            uploadedMetadataEntry
          );
          return {
            ...prevMissingData,
            [sampleId]: rowMissingMetadataWarnings,
          };
        });
        uploadedMetadata[sampleId] = {
          ...existingMetadataEntry,
          ...pick(uploadedMetadataEntry, uploadedFieldsWithData),
        };
        changedMetadataUpdated[sampleId] = {
          ...existingChangedMetadataEntry,
          ...pick(uploadedMetadataEntry, uploadedFieldsWithData),
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
