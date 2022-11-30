import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/pathogenConfig";
import { SampleEditTsvMetadata, SampleUploadTsvMetadata } from "./types";

// Some columns are for optional data. Below string is added to end of the
// header describing what data is in column to indicate it is optional.
export const OPTIONAL_HEADER_MARKER = " - Optional";

// Internal keys we use to represent to various kinds of metadata on a sample
// and the user-visible name we give the info, seen as a header on column.
export const BASE_METADATA_HEADERS = {
  // Headers that are shared between upload and edit sample metadata tsvs
  collectionDate: "Collection Date",
  collectionLocation: "Collection Location",
  keepPrivate: "Sample is Private",
  sequencingDate: "Sequencing Date" + OPTIONAL_HEADER_MARKER,
};

const GENERAL_VIRAL_SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleUploadTsvMetadata,
  string
> = {
  ...BASE_METADATA_HEADERS,
  privateId: "Private ID",
  publicId: "Genbank Accession (Public ID)" + OPTIONAL_HEADER_MARKER,
  sampleId: "Sample Name (from FASTA)",
};

export const SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS: PathogenConfigType<
  Record<keyof SampleUploadTsvMetadata, string>
> = {
  [Pathogen.COVID]: {
    ...BASE_METADATA_HEADERS,
    privateId: "Private ID",
    publicId: "GISAID ID (Public ID)" + OPTIONAL_HEADER_MARKER,
    sampleId: "Sample Name (from FASTA)",
  },
  [Pathogen.MONKEY_POX]: GENERAL_VIRAL_SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
};

const GENERAL_VIRAL_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS: Record<
  keyof SampleEditTsvMetadata,
  string
> = {
  ...BASE_METADATA_HEADERS,
  currentPrivateID: "Current Private ID",
  newPrivateID: "New Private ID" + OPTIONAL_HEADER_MARKER,
  publicId: "GenBank Accession (Public ID)",
};

export const SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS: PathogenConfigType<
  Record<keyof SampleEditTsvMetadata, string>
> = {
  [Pathogen.COVID]: {
    ...BASE_METADATA_HEADERS,
    currentPrivateID: "Current Private ID",
    newPrivateID: "New Private ID" + OPTIONAL_HEADER_MARKER,
    publicId: "Public ID (GISAID ID)",
  },
  [Pathogen.MONKEY_POX]: GENERAL_VIRAL_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
};

const DATE_FORMAT = "YYYY-MM-DD";
const BOOLEAN_FORMAT = "Yes/No";

export const EXAMPLE_SAMPLE_IDS = [
  "Example Sample A",
  "Example Sample B",
  "Example Sample C",
];

export const EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS = [
  "example private ID A",
  "example private ID B",
  "example private ID C",
];

const GENERAL_VIRAL_UPLOAD_EXAMPLE_ROWS = [
  // Very first example row helps explain usage, but not fully valid.
  [
    EXAMPLE_SAMPLE_IDS[0], // sampleId
    "Private sample name", // privateId
    "(if available) GenBank Accession", // publicId -- here as explainer
    DATE_FORMAT, // collectionDate -- not valid, here as explainer in template
    "North America/USA/California/Los Angeles County", // collectionLocation
    DATE_FORMAT, // sequencingDate -- not valid, here as explainer in template
    BOOLEAN_FORMAT, // keepPrivate -- not valid, here as explainer in template
  ],
  // Subsequent example rows are mostly valid, honest-to-goodness examples...
  // ... except for the dates. This is to avoid Excel auto "correct".
  [
    EXAMPLE_SAMPLE_IDS[1], // sampleId
    "id101", // privateId
    "", // publicId -- optional, showing that with blank use
    DATE_FORMAT, // collectionDate
    "San Francisco County", // collectionLocation
    "", // sequencingDate -- optional, showing that with blank use
    "No", // keepPrivate
  ],
  [
    EXAMPLE_SAMPLE_IDS[2], // sampleId
    "id102", // privateId
    "USA/CA-CZB-0001/2021", // publicId
    DATE_FORMAT, // collectionDate
    "North America/USA/California/San Francisco County", // collectionLocation
    DATE_FORMAT, // sequencingDate
    "No", // keepPrivate
  ],
];

export const UPLOAD_EXAMPLE_ROWS: PathogenConfigType<string[][]> = {
  [Pathogen.COVID]: [
    // Very first example row helps explain usage, but not fully valid.
    [
      EXAMPLE_SAMPLE_IDS[0], // sampleId
      "Private sample name", // privateId
      "(if available) GISAID ID", // publicId -- here as explainer
      DATE_FORMAT, // collectionDate -- not valid, here as explainer in template
      "North America/USA/California/Los Angeles County", // collectionLocation
      DATE_FORMAT, // sequencingDate -- not valid, here as explainer in template
      BOOLEAN_FORMAT, // keepPrivate -- not valid, here as explainer in template
    ],
    // Subsequent example rows are mostly valid, honest-to-goodness examples...
    // ... except for the dates. This is to avoid Excel auto "correct".
    [
      EXAMPLE_SAMPLE_IDS[1], // sampleId
      "id101", // privateId
      "", // publicId -- optional, showing that with blank use
      DATE_FORMAT, // collectionDate
      "San Francisco County", // collectionLocation
      "", // sequencingDate -- optional, showing that with blank use
      "No", // keepPrivate
    ],
    [
      EXAMPLE_SAMPLE_IDS[2], // sampleId
      "id102", // privateId
      "USA/CA-CZB-0001/2021", // publicId
      DATE_FORMAT, // collectionDate
      "North America/USA/California/San Francisco County", // collectionLocation
      DATE_FORMAT, // sequencingDate
      "No", // keepPrivate
    ],
  ],
  [Pathogen.MONKEY_POX]: GENERAL_VIRAL_UPLOAD_EXAMPLE_ROWS,
};

export function getEditExampleRows(
  pathogen: Pathogen,
  collectionLocation?: GisaidLocation
): string[][] {
  // return example rows with the countys collectionLocation
  const exampleCollectionLocation = collectionLocation
    ? `${collectionLocation.region}/${collectionLocation.country}/${collectionLocation.division}/${collectionLocation.location}`
    : "North America/USA/Californa/Humboldt County";

  const editRows: PathogenConfigType<string[][]> = {
    [Pathogen.COVID]: [
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[0], // currentPrivateID
        "X3421876", // newPrivateID
        "hCoV-19/USA/demo-17806/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        DATE_FORMAT, // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[1],
        "SOP292344X", // newPrivateID
        "hCoV-19/USA/demo-17807/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        DATE_FORMAT, // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[2],
        "T2348ACT", // newPrivateID
        "hCoV-19/USA/demo-17808/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        "Delete", // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
    ],
    [Pathogen.MONKEY_POX]: [
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[0], // currentPrivateID
        "X3421876", // newPrivateID
        "hMpxV/USA/demo-17806/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        DATE_FORMAT, // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[1],
        "SOP292344X", // newPrivateID
        "hMpxV/USA/demo-17807/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        DATE_FORMAT, // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
      [
        EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[2],
        "T2348ACT", // newPrivateID
        "hMpxV/USA/demo-17808/2021", // publicId
        DATE_FORMAT, // collectionDate,
        exampleCollectionLocation, //collectionLocation
        "Delete", // sequencingDate
        BOOLEAN_FORMAT, // keepPrivate
      ],
    ],
  };

  return editRows[pathogen];
}
