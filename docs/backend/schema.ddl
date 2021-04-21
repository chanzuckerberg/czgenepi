Table "accession_workflows" {
  "workflow_id" integer [not null]
}

Table "accessions" {
  "entity_id" integer [not null]
  "repository_type" "character varying" [not null]
  "public_identifier" "character varying" [not null]
}

Table "align_read_workflows" {
  "workflow_id" integer [not null]
}

Table "aligned_gisaid_dump" {
  "entity_id" integer [not null]
  "s3_bucket" "character varying" [not null]
  "sequences_s3_key" "character varying" [not null]
  "metadata_s3_key" "character varying" [not null]
}

Table "bams" {
  "entity_id" integer [not null]
  "s3_bucket" "character varying" [not null]
  "s3_key" "character varying" [not null]
  "sequencing_depth" float [not null]
}

Table "call_consensus_workflows" {
  "workflow_id" integer [not null]
}

Table "called_pathogen_genomes" {
  "pathogen_genome_id" integer [not null]
}

Table "can_see" {
  "id" integer [not null]
  "viewer_group_id" integer [not null]
  "owner_group_id" integer [not null]
  "data_type" "character varying" [not null]
}

Table "data_types" {
  "item_id" "character varying" [not null]
}

Table "entities" {
  "id" integer [not null]
  "entity_type" "character varying" [not null]
  "producing_workflow_id" integer
}

Table "entity_types" {
  "item_id" "character varying" [not null]
}

Table "filter_read_workflows" {
  "workflow_id" integer [not null]
}

Table "gisaid_alignment_workflows" {
  "workflow_id" integer [not null]
}

Table "gisaid_workflows" {
  "workflow_id" integer [not null]
}

Table "groups" {
  "id" integer [not null]
  "name" "character varying" [not null]
  "email" "character varying" [not null]
  "address" "character varying"
}

Table "host_filtered_sequencing_reads_collections" {
  "entity_id" integer [not null]
  "s3_bucket" "character varying" [not null]
  "s3_key" "character varying" [not null]
}

Table "pathogen_genomes" {
  "entity_id" integer [not null]
  "sequence" "character varying" [not null]
  "num_unambiguous_sites" integer [not null]
  "num_missing_alleles" integer [not null]
  "num_mixed" integer [not null]
  "pangolin_last_updated" "character varying"
  "pangolin_lineage" "character varying"
  "pangolin_probability" integer
  "pangolin_version" "character varying"
}

Table "phylo_runs" {
  "workflow_id" integer [not null]
  "group_id" integer [not null]
  "template_file_path" "character varying"
  "template_args" jsonb [not null]
}

Table "phylo_tree_samples" {
  "sample_id" integer [not null]
  "phylo_tree_id" integer [not null]
}

Table "phylo_trees" {
  "entity_id" integer [not null]
  "s3_bucket" "character varying" [not null]
  "s3_key" "character varying" [not null]
}

Table "processed_gisaid_dump" {
  "entity_id" integer [not null]
  "s3_bucket" "character varying" [not null]
  "sequences_s3_key" "character varying" [not null]
  "metadata_s3_key" "character varying" [not null]
}

Table "public_repository_types" {
  "item_id" "character varying" [not null]
}

Table "raw_gisaid_dump" {
  "entity_id" integer [not null]
  "download_date" timestamp [not null]
  "s3_bucket" "character varying" [not null]
  "s3_key" "character varying" [not null]
}

Table "region_types" {
  "item_id" "character varying" [not null]
}

Table "samples" {
  "id" integer [not null]
  "submitting_group_id" integer [not null]
  "private_identifier" "character varying" [not null]
  "original_submission" json [not null]
  "public_identifier" "character varying" [not null]
  "sample_collected_by" "character varying" [not null]
  "sample_collector_contact_email" "character varying"
  "sample_collector_contact_address" "character varying" [not null]
  "authors" jsonb [not null]
  "collection_date" date [not null]
  "location" "character varying" [not null]
  "division" "character varying" [not null]
  "country" "character varying" [not null]
  "region" "character varying" [not null]
  "organism" "character varying" [not null]
  "host" "character varying"
  "purpose_of_sampling" "character varying"
  "specimen_processing" "character varying"
}

Table "sequencing_instrument_types" {
  "item_id" "character varying" [not null]
}

Table "sequencing_protocol_types" {
  "item_id" "character varying" [not null]
}

Table "sequencing_reads_collections" {
  "entity_id" integer [not null]
  "sample_id" integer [not null]
  "sequencing_instrument" "character varying" [not null]
  "sequencing_protocol" "character varying" [not null]
  "s3_bucket" "character varying" [not null]
  "s3_key" "character varying" [not null]
  "sequencing_date" date
  "upload_date" timestamp [not null, default: `now()`]
}

Table "uploaded_pathogen_genomes" {
  "pathogen_genome_id" integer [not null]
  "sample_id" integer [not null]
  "sequencing_depth" float
  "upload_date" timestamp [not null, default: `now()`]
}

Table "users" {
  "id" integer [not null]
  "name" "character varying" [not null]
  "email" "character varying" [not null]
  "auth0_user_id" "character varying" [not null]
  "group_admin" boolean [not null]
  "system_admin" boolean [not null]
  "group_id" integer [not null]
}

Table "workflow_inputs" {
  "entity_id" integer [not null]
  "workflow_id" integer [not null]
}

Table "workflow_status_types" {
  "item_id" "character varying" [not null]
}

Table "workflow_types" {
  "item_id" "character varying" [not null]
}

Table "workflows" {
  "id" integer [not null]
  "workflow_type" "character varying" [not null]
  "start_datetime" timestamp
  "end_datetime" timestamp
  "workflow_status" "character varying" [not null]
  "software_versions" json [not null]
}

Table "alembic_version" {
  "version_num" "character varying(32)" [not null]
}

Ref:"workflows"."id" < "accession_workflows"."workflow_id"

Ref:"entities"."id" < "accessions"."entity_id"

Ref:"public_repository_types"."item_id" < "accessions"."repository_type"

Ref:"workflows"."id" < "align_read_workflows"."workflow_id"

Ref:"entities"."id" < "aligned_gisaid_dump"."entity_id"

Ref:"entities"."id" < "bams"."entity_id"

Ref:"workflows"."id" < "call_consensus_workflows"."workflow_id"

Ref:"pathogen_genomes"."entity_id" < "called_pathogen_genomes"."pathogen_genome_id"

Ref:"data_types"."item_id" < "can_see"."data_type"

Ref:"groups"."id" < "can_see"."owner_group_id"

Ref:"groups"."id" < "can_see"."viewer_group_id"

Ref:"entity_types"."item_id" < "entities"."entity_type"

Ref:"workflows"."id" < "entities"."producing_workflow_id"

Ref:"workflows"."id" < "filter_read_workflows"."workflow_id"

Ref:"workflows"."id" < "gisaid_alignment_workflows"."workflow_id"

Ref:"workflows"."id" < "gisaid_workflows"."workflow_id"

Ref:"entities"."id" < "host_filtered_sequencing_reads_collections"."entity_id"

Ref:"entities"."id" < "pathogen_genomes"."entity_id"

Ref:"groups"."id" < "phylo_runs"."group_id"

Ref:"workflows"."id" < "phylo_runs"."workflow_id"

Ref:"phylo_trees"."entity_id" < "phylo_tree_samples"."phylo_tree_id"

Ref:"samples"."id" < "phylo_tree_samples"."sample_id"

Ref:"entities"."id" < "phylo_trees"."entity_id"

Ref:"entities"."id" < "processed_gisaid_dump"."entity_id"

Ref:"entities"."id" < "raw_gisaid_dump"."entity_id"

Ref:"region_types"."item_id" < "samples"."region"

Ref:"groups"."id" < "samples"."submitting_group_id"

Ref:"entities"."id" < "sequencing_reads_collections"."entity_id"

Ref:"samples"."id" < "sequencing_reads_collections"."sample_id"

Ref:"sequencing_instrument_types"."item_id" < "sequencing_reads_collections"."sequencing_instrument"

Ref:"sequencing_protocol_types"."item_id" < "sequencing_reads_collections"."sequencing_protocol"

Ref:"pathogen_genomes"."entity_id" < "uploaded_pathogen_genomes"."pathogen_genome_id"

Ref:"samples"."id" < "uploaded_pathogen_genomes"."sample_id"

Ref:"groups"."id" < "users"."group_id"

Ref:"entities"."id" < "workflow_inputs"."entity_id"

Ref:"workflows"."id" < "workflow_inputs"."workflow_id"

Ref:"workflow_status_types"."item_id" < "workflows"."workflow_status"

Ref:"workflow_types"."item_id" < "workflows"."workflow_type"
