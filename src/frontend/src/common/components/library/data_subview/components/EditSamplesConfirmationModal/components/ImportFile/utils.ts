// we need to decide if a user wants to delete a sample (if they provide a delete keyword in the cell)

import { SampleEditMetadataWebform } from "src/components/WebformTable/common/types";
import { SampleIdToWarningMessages, warnMissingMetadata } from "./parseFile";

// if no delete keyword is detected, return the existing value, else return "".
export function passOrDeleteEntry(
  value: string | boolean | NamedGisaidLocation
): string | boolean | NamedGisaidLocation | undefined {
  if (value && value.toString().toLowerCase() === "delete") {
    return "";
  }
  return value;
}

export function getNonEmptyUploadedMetadataFields(
  uploadedMetadataEntry: SampleEditMetadataWebform
): string[] {
  // get metadata entries from upload that are not empty (means user wants to import new data)
  const uploadedFieldsWithData: string[] = [];
  // TODO: replace with a filter call instead
  Object.keys(uploadedMetadataEntry).forEach(function (item) {
    const uploadedEntry =
      uploadedMetadataEntry[item as keyof SampleEditMetadataWebform];
    if (uploadedEntry !== "" && uploadedEntry !== undefined)
      uploadedFieldsWithData.push(item);
  });
  return uploadedFieldsWithData;
}

export function getMissingMetadata(
  existingMetadataEntry: SampleEditMetadataWebform,
  filledInUploadedMetadata: SampleEditMetadataWebform,
  prevMissingData: SampleIdToWarningMessages,
  sampleId: string
): SampleIdToWarningMessages {
  const rowMissingMetadataWarnings = warnMissingMetadata({
    ...existingMetadataEntry,
    ...filledInUploadedMetadata,
  });
  if (rowMissingMetadataWarnings) {
    return {
      ...prevMissingData,
      [sampleId]: rowMissingMetadataWarnings,
    };
  }
  return { ...prevMissingData };
}
