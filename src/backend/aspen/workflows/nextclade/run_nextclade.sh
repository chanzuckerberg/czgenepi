#!/bin/bash

# Environmental vars required for script to run
# (Either set by WDL for on-demand_or by orchestrating process for scheduled.)
# PATHOGEN_SLUG
#   The Pathogen.slug for whatever pathogen we want to run Nextclade on.
# SAMPLE_IDS_FILENAME
#   Samples to run Nextclade against and save results for.
#   Plain text file of sample PK ids, one per line.
#   All samples must be for the same pathogen, same as PATHOGEN_SLUG above

# TODO: fix pipefail flags to be informative
set -Eeuxo pipefail
shopt -s inherit_errexit  # no silent breaking

# Save certain attributes to a file about the pathogen samples belong to.
PATHOGEN_INFO_FILE=pathogen_info.json

# Pull sequences from DB and write them out. Capture other necessary info too.
SEQUENCES_FILE=sequences.fasta
/usr/local/bin/python3.10 /usr/src/app/aspen/workflows/nextclade/prep_samples.py \
  --pathogen-slug "${PATHOGEN_SLUG}" \
  --sample-ids-file "${SAMPLE_IDS_FILENAME}" \
  --sequences "${SEQUENCES_FILE}" \
  --pathogen-info-file "${PATHOGEN_INFO_FILE}"

nextclade_dataset_name=$(jq --raw-output ".nextclade_dataset_name" "${PATHOGEN_INFO_FILE}")
echo "Pulling nextclade reference dataset with name ${nextclade_dataset_name}"
NEXTCLADE_DATASET_DIR=nextclade_dataset_bundle
nextclade dataset get \
  --name "${nextclade_dataset_name}" \
  --output-dir "${NEXTCLADE_DATASET_DIR}"
# Inside bundle, this file has info about the bundle we want to capture.
DATASET_TAG_FILE=tag.json

echo "Starting nextclade run"
NEXTCLADE_OUTPUT_DIR=output
nextclade run \
  --input-dataset "${NEXTCLADE_DATASET_DIR}" \
  --output-all "${NEXTCLADE_OUTPUT_DIR}" \
  "${SEQUENCES_FILE}"
echo "Nextclade run complete"

pathogen_slug=$(jq --raw-output ".pathogen_slug" "${PATHOGEN_INFO_FILE}")
# save results back to db
/usr/local/bin/python3.10 /usr/src/app/aspen/workflows/nextclade/save.py \
    --nextclade-csv "${NEXTCLADE_OUTPUT_DIR}/nextclade.csv" \
    --nextclade-dataset-tag "${NEXTCLADE_DATASET_DIR}/${DATASET_TAG_FILE}" \
    --nextclade-version "$(nextclade --version)" \
    --pathogen-slug "${pathogen_slug}"
