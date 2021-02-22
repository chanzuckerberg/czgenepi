///////////////////////////////////////////////////
// Groups and users

Table Group {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
  email VARCHAR [not null, unique]
  address VARCHAR // required only for repository submission. feasible that there are multiple labs at the same address.
}

Table User {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
  email VARCHAR [not null, unique]
  auth0_user_id VARCHAR [not null]
  group INT [not null, ref: > Group.id]
  group_admin bool [not null]
  system_admin bool [not null]
}


///////////////////////////////////////////////////
// Cross-group viewing

Table TypeOfData {
  // Types of data people can view.  This table should be pre-populated with at least the following entries:
  //  1. Trees
  //  2. Sequences
  //  3. Metadata (other than private identifiers)
  //  4. Private identifiers
  id INT [pk, increment]
  name VARCHAR [not null]
}

// members of group A (viewer_group) can see data uploaded by group B (owner_group)
Table GroupCanSee {
  viewer_group_id INT [not null, ref: > Group.id]
  owner_group_id INT [not null, ref: > Group.id]
  type_of_data_id INT [not null, ref: > TypeOfData.id]

  Indexes {
    (viewer_group_id, owner_group_id, type_of_data_id) [unique]
  }
}


///////////////////////////////////////////////////
// Samples

Table Sample {
  id INT [pk, increment]
  submitting_group_id INT [not null, ref: > Group.id]
  private_identifier VARCHAR [not null]  // ideally this is the same as specimen_collector_sample_id noted below, but many DPHs will not be comfortable sharing these

  original_submission JSONB [not null]

  // This is the public identifier we assign to this sample.  The identifier assigned by the public repositories is
  // stored on the related Accession objects.
  public_identifer VARCHAR [not null, unique]              // maps to isolate, force format to pathogen/country/specimen_collector_sample_id/year, e.g., USA/CZB-1234/2020

  sample_collected_by VARCHAR [not null]                   // maps to sample_collected_by
  sample_collector_contact_email VARCHAR                   // maps to sample_collector_contact_email
  sample_collector_contact_address VARCHAR                 // maps to sample_collector_contact_address
  authors JSONB

  collection_date DATE [not null]                          // maps to sample_collection_date
  location VARCHAR [not null]
  division VARCHAR [not null]                              // maps to geo_loc_name_state_province_region
  country VARCHAR [not null]                               // maps to geo_loc_name_country

  organism VARCHAR [not null]                              // maps to organism
  host VARCHAR                                             // maps to host_common_name (default to human)
  purpose_of_sampling VARCHAR                              // maps to purpose_of_sampling pull pick-list values from ph4ge (can be in UI)
  specimen_processing VARCHAR                              // maps to specimen_processing

  Indexes {
    (submitting_group_id, private_identifier) [unique]
  }
}


///////////////////////////////////////////////////
// Entities and Workflows

Table Entity {
  id INT [pk, increment]
  producing_workflow_id INT [ref: > Workflow.id]
}

Table WorkflowType {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
}

Table Workflow {
  id INT [pk, increment]
  workflow_type_id INT [not null, ref: > WorkflowType.id]

  run_date DATETIME [not null]
  pipeline_versions JSONB [not null]
}

Table WorkflowInputs {
  entity_id INT [not null, ref: > Entity.id]
  workflow_id INT [not null, ref: > Workflow.id]

  Indexes {
    (entity_id, workflow_id) [unique]
  }
}


///////////////////////////////////////////////////
// Public accession ids

Table PublicRepository {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
  website VARCHAR [unique]
}

Table Accession {
  entity_id INT [not null, ref: > Entity.id]
  public_repository_id INT [not null, ref: > PublicRepository.id]
  public_identifier VARCHAR [not null]

  Indexes {
    (entity_id, public_repository_id) [unique]
    (public_repository_id, public_identifier) [unique]
  }
}


///////////////////////////////////////////////////
// Sequences

// describes a sequencer machine  (TODO: what's a good way of canonicalizing this?)
Table SequencingInstrument {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
}

// describes a sequencing protocol  (TODO: what's a good way of canonicalizing this?)
Table SequencingProtocol {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
}

// describes a single set of sequence data from the sequencer. (FASTQ)
// these should be replaced by the `HostFilteredSequenceRead` as soon as it is available so we are not storing any host reads
Table SequencingReads {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  sample_id INT [not null, unique, ref: - Sample.id]
  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null]

  sequencing_instrument_id INT [not null, ref: > SequencingInstrument.id]
  sequencing_protocol_id INT [not null, ref: > SequencingProtocol.id]

  // sequencing date is optional, but sample collection date should not be.
  sequencing_date DATE

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}

// describes a single pathogen sequence
Table PathogenGenome {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: > Entity.id]

  sequence VARCHAR [not null]

  // sequence statistics we can calculate from the fasta file
  num_unambiguous_sites INT [not null]
  num_n INT [not null]
  num_mixed INT [not null]

}

// describes a single sequence that was uploaded to the system directly.
Table UploadedPathogenGenome {
  pathogen_genome_id INT [not null, unique, ref: - PathogenGenome.id]
  sample_id INT [not null, unique, ref: - Sample.id]

  // optional field for gisaid submission, we would like to get users to provide this.
  sequencing_depth FLOAT
}

// describes a single sequence that was called from a consensus genome run
Table CalledPathogenGenome {
  pathogen_genome_id INT [not null, unique, ref: - PathogenGenome.id]
}

///////////////////////////////////////////////////
// Consensus genome pipeline

// TODO: @jackkamm do the BAM/SRA records need to store any metrics?

Table HostFilteredSequenceRead {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  // For the MVP, we will just store them, in the future, we would ship them to archives and store just a pointer.
  // These should be Entities.

  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null, unique]

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}

Table Bam {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  // For the MVP, we will just store them, in the future, we would ship them to archives and store just a pointer.
  // These should be Entities.

  // statistics from the consensus genome pipeline.
  sequencing_depth FLOAT [not null]

  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null, unique]

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}


///////////////////////////////////////////////////
// GISAID dumps

Table RawGisaidDump {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  download_date datetime [not null]

  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null, unique]

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}

Table ProcessedGisaidDump {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null, unique]

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}


///////////////////////////////////////////////////
// Phylo pipeline

Table PhyloTree {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null, unique]

  Indexes {
    (s3_bucket, s3_key) [unique]
  }
}
