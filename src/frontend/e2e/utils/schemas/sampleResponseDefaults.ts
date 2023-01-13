export type SampleResponseDefaults = {
  collection_date?: string;
  collection_location?: number;
  gisaid_id?: string | null;
  gisaid_status?: string;
  id?: number;
  lineages?: [Lineage];
  qc_metrics?: [QCMetrics];
  private?: boolean;
  upload_date?: string;
};
