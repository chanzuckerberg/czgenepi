import { pick } from "lodash";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "src/components/WebformTable/common/constants";
import {
  Metadata,
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
  SampleIdToMetadata,
} from "src/components/WebformTable/common/types";

export function structureInitialMetadata(
  item: Sample
): SampleEditMetadataWebform {
  const i: SampleEditMetadataWebform = pick(
    item,
    Object.keys(SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS)
  );
  if (i.collectionLocation) {
    i.collectionLocation.name = stringifyGisaidLocation(i.collectionLocation);
  }
  return i;
}
export function findMetadataChanges(
  combinedMetadata: string | boolean | NamedGisaidLocation,
  currentMetadata: SampleEditMetadataWebform
): SampleEditMetadataWebform {
  // see where the current and incoming metadata diverges (compare values or current and incoming metadata)
  return Object.entries(combinedMetadata).reduce(
    (acc: SampleEditMetadataWebform, [key, value]) => {
      if (!Object.values(currentMetadata).includes(value)) {
        acc[key as keyof SampleEditMetadataWebform] = value;
      }
      return acc;
    },
    {}
  );
}

export function getMetadataEntryOrEmpty(
  metadata: SampleIdToEditMetadataWebform | null,
  sampleID: string
): SampleEditMetadataWebform {
  const emptyMetadata: SampleEditMetadataWebform = {};
  if (metadata && metadata[sampleID]) {
    return metadata[sampleID];
  }
  return emptyMetadata;
}

export function setApplyAllValueToPrevMetadata(
  prevMetadata: SampleIdToEditMetadataWebform | SampleIdToMetadata | null,
  fieldKey: keyof Metadata,
  value: unknown
): SampleIdToEditMetadataWebform | SampleIdToMetadata {
  const newMetadata: SampleIdToEditMetadataWebform | SampleIdToMetadata = {};

  for (const [sampleId, sampleMetadata] of Object.entries(
    prevMetadata || EMPTY_OBJECT
  )) {
    newMetadata[sampleId] = {
      ...(sampleMetadata as Record<string, unknown>),
      [fieldKey]: value,
    };
  }
  return newMetadata;
}
