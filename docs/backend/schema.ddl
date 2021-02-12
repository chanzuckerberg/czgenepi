///////////////////////////////////////////////////
// Groups and users

Table Group {
  id INT [pk, increment]
  name VARCHAR [not null, unique]
  email VARCHAR [not null, unique]
  address VARCHAR [not null, unique]
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
  //  3. Metadata
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
// Physical Samples

Table PhysicalSample {
  id INT [pk, increment]
  submitting_group_id INT [not null, ref: > Group.id]
  private_identifier VARCHAR [not null]

  original_submission JSONB [not null]

  // This is the public identifier we assign to this sample.  The identifier assigned by the public repositories is
  // stored on the related Accession objects.
  public_identifer VARCHAR [not null, unique]              // maps to specimen_collector_sample_id and isolate

  // TODO: (sidneymbell) going to see if these are necessary.
  // collector VARCHAR [not null]                             // maps to sample_collected_by
  // collector_email VARCHAR                                  // maps to sample_collector_contact_email
  // collector_address VARCHAR                                // maps to sample_collector_contact_address
  // sequencer VARCHAR                                        // maps to sequence_submitted_by
  // sequencer_email VARCHAR                                  // maps to sequence_submitter_contact_email
  // sequencer_address VARCHAR                                // maps to sequence_submitter_contact_address

  collection_date DATETIME [not null]                      // maps to sample_collection_date
  location VARCHAR [not null]
  division VARCHAR [not null]                              // maps to geo_loc_name_state_province_region
  country VARCHAR [not null]                               // maps to geo_loc_name_country
  country_residence VARCHAR                                // maps to host_origin_geo_loc_country
  country_exposure VARCHAR                                 // maps to location_of_exposure_geo_loc_name_country
  travel_history VARCHAR                                   // maps to travel_history

  organism VARCHAR [not null]                              // maps to organism
  purpose_of_sampling VARCHAR                              // maps to purpose_of_sampling
  anatomical_material VARCHAR                              // maps to anatomical_material
  anatomical_part VARCHAR                                  // maps to anatomical_part
  body_product VARCHAR                                     // maps to body_product
  environmental_material VARCHAR                           // maps to environmental_material
  environmental_site VARCHAR                               // maps to environmental_site
  collection_device VARCHAR                                // maps to collection_device
  collection_method VARCHAR                                // maps to collection_method
  collection_protocol VARCHAR                              // maps to collection_protocol
  specimen_processing VARCHAR                              // maps to specimen_processing
  lab_host VARCHAR                                         // maps to lab_host
  passage_number VARCHAR                                   // maps to passage_number
  passage_method VARCHAR                                   // maps to passage_method
  biomaterial_extracted VARCHAR                            // maps to biomaterial_extracted
  host_common_name VARCHAR                                 // maps to host_common_name
  host_scientific_name VARCHAR                             // maps to host_scientific_name
  host_health_state VARCHAR                                // maps to host_health_state
  host_health_status_details VARCHAR                       // maps to host_health_status_details
  host_disease VARCHAR                                     // maps to host_disease

  symptom_onset_date DATETIME                              // maps to symptom_onset_date
  signs_and_symptoms VARCHAR                               // maps to signs_and_symptoms
  exposure_event VARCHAR                                   // maps to exposure_event

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
Table SequencingReads {
  id INT [pk, increment]
  entity_id INT [not null, unique, ref: - Entity.id]

  physical_sample_id INT [not null, unique, ref: - PhysicalSample.id]
  s3_bucket VARCHAR [not null]
  s3_key VARCHAR [not null]

  sequencing_instrument_id INT [not null, ref: > SequencingInstrument.id]
  sequencing_protocol_id INT [not null, ref: > SequencingProtocol.id]

  // sequencing date is optional, but sample collection date should not be.
  sequencing_date FLOAT

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
  physical_sample_id INT [not null, unique, ref: - PhysicalSample.id]

  // optional field for gisaid submission, we'd like to get users to provide this.
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
