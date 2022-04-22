import { pick } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { createStringToLocationFinder } from "src/common/utils/locationUtils";
import FilePicker from "src/components/FilePicker";
import ImportFileWarnings, {
  getAutocorrectCount,
  getMissingFields,
} from "src/components/ImportFileWarnings";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "src/components/WebformTable/common/constants";
import {
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
import {
  NamedGisaidLocation,
  Props as CommonProps,
} from "src/views/Upload/components/common/types";
import { getMetadataEntryOrEmpty } from "../../utils";
import {
  parseFileEdit,
  ParseResult,
  SampleIdToWarningMessages,
} from "./parseFile";

interface Props {
  metadata: SampleIdToEditMetadataWebform | null;
  changedMetadata: SampleIdToEditMetadataWebform | null;
  namedLocations: NamedGisaidLocation[];
  setMetadata: CommonProps["setMetadata"];
  hasImportedMetadataFile: boolean;
  setHasImportedMetadataFile(x: boolean): void;
  setAutocorrectWarnings(x: SampleIdToWarningMessages): void;
  setChangedMetadata: CommonProps["setMetadata"];
}

export default function ImportFile({
  metadata,
  namedLocations,
  setMetadata,
  setChangedMetadata,
  hasImportedMetadataFile,
  setHasImportedMetadataFile,
  setAutocorrectWarnings,
  changedMetadata,
}: Props): JSX.Element {
  const [missingFields, setMissingFields] = useState<string[] | null>(null);
  const [autocorrectCount, setAutocorrectCount] = useState<number>(0);
  const [filename, setFilename] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [extraneousSampleIds, setExtraneousSampleIds] = useState<string[]>([]);
  const [missingData, setMissingData] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);
  const [badFormatData, setBadFormatData] =
    useState<SampleIdToWarningMessages>(EMPTY_OBJECT);

  useEffect(() => {
    // If no file uploaded yet, do nothing.
    if (!parseResult) return;
    // If file was missing any col header fields, we parsed no data from it
    // and only display that error to the user to force them to fix problems.
    if (getMissingFields(parseResult)) return;

    const { data } = parseResult;
    const parseResultSampleIds = Object.keys(data);
    const sampleIds = Object.keys(metadata || EMPTY_OBJECT);

    const sampleIdsSet = new Set(sampleIds);
    const extraneousSampleIds = parseResultSampleIds.filter((parseId) => {
      return !sampleIdsSet.has(parseId);
    });
    setExtraneousSampleIds(extraneousSampleIds);
  }, [parseResult, metadata]);

  // Used by file upload parser to convert location strings to Locations
  const stringToLocationFinder = useMemo(() => {
    return createStringToLocationFinder(namedLocations);
  }, [namedLocations]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const result = await parseFileEdit(files[0], stringToLocationFinder);

    const { warningMessages, filename } = result;
    const missingFields = getMissingFields(result);
    const autocorrectCount =
      getAutocorrectCount(warningMessages.get(WARNING_CODE.AUTO_CORRECT)) || 0;
    setHasImportedMetadataFile(true);
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

    handleMetadataFileUpload(result);
  };

  function inferDeleteEntries(
    value: string | boolean | NamedGisaidLocation
  ): string | boolean | NamedGisaidLocation | undefined {
    if (value && value.toString().toLowerCase() == "delete") {
      return "";
    }
    return value;
  }

  function handleMetadataFileUpload(result: ParseResult) {
    // If they're on the page but somehow have no samples (eg, refreshing on
    // Metadata page), short-circuit and do nothing to avoid any weirdness.
    if (!metadata) return;

    const { data: sampleIdToUploadedMetadata, warningMessages } = result;

    // Filter out any metadata for samples they did not just upload
    // Note: Might be cleaner to do this filtering inside of file parse call,
    // but would require changing the way some of the warnings work currently.
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
        const uploadedMetadataEntry = sampleIdToUploadedMetadata[sampleId];

        if (uploadedMetadataEntry) {
          // get metadata entries from upload that are not empty (means user wants to import new data)
          const uploadedFieldsWithData: string[] = [];
          Object.keys(uploadedMetadataEntry).forEach(function (item) {
            if (
              uploadedMetadataEntry[item as keyof SampleEditMetadataWebform] !=
              ""
            )
              uploadedFieldsWithData.push(item);
          });

          // check if any entries need to be deleted/ cleared
          for (const [key, value] of Object.entries(uploadedMetadataEntry)) {
            (uploadedMetadataEntry[key as keyof SampleEditMetadataWebform] as
              | string
              | boolean
              | NamedGisaidLocation
              | undefined) = inferDeleteEntries(value);
          }
          uploadedMetadata[sampleId] = {
            ...existingMetadataEntry,
            ...pick(uploadedMetadataEntry, uploadedFieldsWithData),
          };
          changedMetadataUpdated[sampleId] = {
            ...exitingChangedMetadataEntry,
            ...pick(uploadedMetadataEntry, uploadedFieldsWithData),
          };
        }
      }
    }

    setMetadata(uploadedMetadata);
    setChangedMetadata(changedMetadataUpdated);
    setHasImportedMetadataFile(true);

    setAutocorrectWarnings(
      warningMessages.get(WARNING_CODE.AUTO_CORRECT) || EMPTY_OBJECT
    );
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
        missingData={missingData}
        badFormatData={badFormatData}
        IdColumnNameForWarnings={
          SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.privateId
        }
        metadataUploadType={MetadataUploadTypeOption.Edit}
      />
    </>
  );
}
