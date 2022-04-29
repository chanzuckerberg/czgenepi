import {
  BASE_METADATA_HEADERS,
  OPTIONAL_HEADER_MARKER,
} from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleEditMetadataWebform } from "./types";

export const SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleEditMetadataWebform,
  string
> = {
  ...BASE_METADATA_HEADERS,
  privateId: "Private ID",
  publicId: "GISAID ID (Public ID)" + OPTIONAL_HEADER_MARKER,
};

export const EMPTY_METADATA: SampleEditMetadataWebform = {
  collectionDate: "",
  collectionLocation: undefined,
  keepPrivate: false,
  privateId: "",
  publicId: "",
  sequencingDate: "",
};
