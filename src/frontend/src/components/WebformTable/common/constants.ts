import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import {
  BASE_METADATA_HEADERS,
  OPTIONAL_HEADER_MARKER,
} from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleEditMetadataWebform } from "./types";

const GENERAL_VIRAL_SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleEditMetadataWebform,
  string
> = {
  ...BASE_METADATA_HEADERS,
  privateId: "Private ID",
  publicId: "GenBank Accession (Public ID)" + OPTIONAL_HEADER_MARKER,
};

export const SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS: PathogenConfigType<
  Record<keyof SampleEditMetadataWebform, string>
> = {
  [Pathogen.COVID]: {
    ...BASE_METADATA_HEADERS,
    privateId: "Private ID",
    publicId: "GISAID ID (Public ID)" + OPTIONAL_HEADER_MARKER,
  },
  [Pathogen.MONKEY_POX]:
    GENERAL_VIRAL_SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS,
};

export const EMPTY_METADATA: SampleEditMetadataWebform = {
  collectionDate: "",
  collectionLocation: undefined,
  keepPrivate: false,
  privateId: "",
  publicId: "",
  sequencingDate: "",
};
