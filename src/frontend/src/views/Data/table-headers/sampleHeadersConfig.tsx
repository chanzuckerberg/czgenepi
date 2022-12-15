import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import {
  COLLECTION_DATE_HEADER,
  COLLECTION_LOCATION_HEADER,
  GISAID_HEADER,
  LINEAGE_HEADER,
  PRIVATE_ID_HEADER,
  PUBLIC_ID_HEADER,
  SEQUENCING_DATE_HEADER,
  UPLOAD_DATE_HEADER,
} from "./commonSampleHeaders";

const covidPublicIdTooltip = {
  boldText: "Public ID",
  regularText: "This is your GISAID ID or Public ID generated by CZ Gen Epi.",
};
export const SAMPLE_HEADERS: PathogenConfigType<Header[]> = {
  [Pathogen.COVID]: [
    PRIVATE_ID_HEADER,
    {
      ...PUBLIC_ID_HEADER,
      tooltip: covidPublicIdTooltip,
    },
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
