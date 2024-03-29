import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import {
  COLLECTION_DATE_HEADER,
  COLLECTION_LOCATION_HEADER,
  GISAID_HEADER,
  LINEAGE_HEADER,
  PRIVATE_ID_HEADER,
  PUBLIC_ID_HEADER,
  QC_METRICS_HEADER,
  SEQUENCING_DATE_HEADER,
  UPLOAD_DATE_HEADER,
} from "./commonSampleHeaders";
import { MetadataExportHeader } from "./types";

export const SAMPLE_HEADERS: PathogenConfigType<
  MetadataExportHeader<Sample>[]
> = {
  [Pathogen.COVID]: [
    PRIVATE_ID_HEADER,
    PUBLIC_ID_HEADER,
    COLLECTION_DATE_HEADER,
    LINEAGE_HEADER,
    UPLOAD_DATE_HEADER,
    COLLECTION_LOCATION_HEADER,
    SEQUENCING_DATE_HEADER,
    GISAID_HEADER,
  ],
  [Pathogen.MONKEY_POX]: [
    PRIVATE_ID_HEADER,
    PUBLIC_ID_HEADER,
    COLLECTION_DATE_HEADER,
    LINEAGE_HEADER,
    UPLOAD_DATE_HEADER,
    COLLECTION_LOCATION_HEADER,
    SEQUENCING_DATE_HEADER,
  ],
};

// This is for headers we want in the TSV, but not in the table
export const SAMPLE_HEADERS_TSV_ONLY = [QC_METRICS_HEADER];
