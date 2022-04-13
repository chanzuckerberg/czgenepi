import { Metadata } from "src/components/WebformTable/common/types";
import { EMPTY_METADATA } from "./constants";

/**
 * Initializes a new metadata object for a sample that user later fills in.
 *
 * The sampleId is established during the `Samples` (FASTA) upload step.
 * When the user first gets to the `Metadata` step, the privateId should be
 * defaulted to match that sampleId, although they can then override it.
 */
export function initSampleMetadata(sampleId: string): Metadata {
  const metadata = { ...EMPTY_METADATA };
  metadata.sampleId = sampleId;
  metadata.privateId = sampleId;
  return metadata;
}
