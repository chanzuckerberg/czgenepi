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
  lineages: [
    {
      lineage_type: string;
      lineage: string;
      lineage_software_version: string;
      last_updated: string;
      lineage_probability?: number;
      reference_dataset_name?: string;
      reference_sequence_accession?: string;
      reference_dataset_tag?: string;
      scorpio_call?: string;
      scorpio_support?: string;
      qc_status?: string;
    }
  ];
  qc_metrics: [
    {
      qc_score?: string;
      qc_software_version: string;
      qc_status: string;
      qc_caller: string;
      reference_dataset_name?: string;
      reference_sequence_accession?: string;
      reference_dataset_tag?: string;
    }
  ];
};
