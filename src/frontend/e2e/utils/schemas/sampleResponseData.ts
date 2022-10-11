export type SampleResponseData = {
  id: number | undefined;
  collection_date: string | undefined;
  collection_location: {
    id?: number;
    region: string;
    country: string;
    division: string;
    location: string;
  };
  czb_failed_genome_recovery?: boolean;
  gisaid: {
    gisaid_id: string | null;
    status: string;
  };
  lineage: {
    last_updated: string;
    lineage?: string;
    confidence: string;
    version: string;
    scorpio_call: string;
    scorpio_support: number;
    qc_status: string;
  };
  private?: boolean;
  private_identifier: string;
  public_identifier: string;
  sequencing_date: string;
  submitting_group: {
    id: number;
    name: string;
  };
  upload_date?: string;
  uploaded_by: {
    id: number;
    name: string;
  };
};
