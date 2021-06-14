import invert from "lodash/invert";
import { Metadata } from "src/views/Upload/components/common/types";

export type ParsedMetadata = Record<
  "sampleId" | keyof Metadata,
  string | boolean | undefined
>;

export const METADATA_KEYS_TO_HEADERS: Record<keyof ParsedMetadata, string> = {
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  islAccessionNumber: "ISL Accession # (optional)",
  keepPrivate: "Sample is Private",
  publicId: "Sample Public ID",
  sampleId: "Sample Private ID",
  sequencingDate: "Sequencing Date (optional)",
  submittedToGisaid: "Previously Submitted to GISAID?",
};

export const HEADERS_TO_METADATA_KEYS = invert(
  METADATA_KEYS_TO_HEADERS
) as Record<string, keyof ParsedMetadata>;
