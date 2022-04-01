export interface SampleUploadTsvMetadata {
  // `sampleId`, unlike all others, should not be user-editable in Metadata
  // step. Instead, it IDs the sample that this metadata is tied to.
  sampleId?: string;
  privateId?: string;
  collectionDate?: string;
  keepPrivate?: boolean;
  publicId?: string;
  sequencingDate?: string;
  collectionLocation?: NamedGisaidLocation;
}

export interface SampleEditTsvMetadata
  extends Omit<SampleUploadTsvMetadata, "sampleId" | "privateId"> {
  currentPrivateID?: string;
  newPrivateID?: string;
}
