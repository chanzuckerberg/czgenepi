import { pick } from "lodash";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { stringifyGisaidLocation } from "src/common/utils/locationUtils";
import {
  EMPTY_METADATA,
  SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS,
} from "src/components/WebformTable/common/constants";
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
  if (i.collectionLocation && typeof i.collectionLocation !== "string") {
    i.collectionLocation.name = stringifyGisaidLocation(i.collectionLocation);
  }
  i.keepPrivate = item.private;
  return i;
}
export function findMetadataChanges(
  combinedMetadata: SampleEditMetadataWebform,
  currentMetadata: SampleEditMetadataWebform
): SampleEditMetadataWebform {
  // see where the current and incoming metadata diverges (compare values or current and incoming metadata)
  return Object.entries(combinedMetadata).reduce(
    (acc: SampleEditMetadataWebform, [key, value]) => {
      if (!Object.values(currentMetadata).includes(value)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - ignoring as part of muiV5/czifuiV7 upgrade. Would be good to fix this later.
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

export function initSampleMetadata(
  sampleId: string
): SampleEditMetadataWebform {
  const metadata = { ...EMPTY_METADATA };
  metadata.privateId = sampleId;
  return metadata;
}

export function getInitialMetadata(
  samplesCanEdit: Sample[]
): SampleIdToEditMetadataWebform {
  const initialMetadata: SampleIdToEditMetadataWebform = {};
  samplesCanEdit.forEach((item) => {
    initialMetadata[item.privateId] = structureInitialMetadata(item);
  });
  return initialMetadata;
}
