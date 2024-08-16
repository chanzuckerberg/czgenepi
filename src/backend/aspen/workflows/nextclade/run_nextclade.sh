#!/bin/bash

# Environmental vars required for script to run:
# PATHOGEN_SLUG
#   The Pathogen.slug for whatever pathogen we want to run Nextclade on.
# RUN_TYPE
#   What kind of run this is. We use the same overall workflow for running on
#   specific samples and for doing a scheduled refresh job. Setting this value
#   controls which type. See `prep_samples.py` for allowed values.
# SAMPLE_IDS_FILENAME
#   If RUN_TYPE is a run against specified ids, this file has which samples to
#   run Nextclade on and save results for. If other run type, file is ignored.
#   If it's being used, it's a plain text file of sample PK ids, one per line.
#   All samples must be for the same pathogen, same as PATHOGEN_SLUG above.

# TODO: fix pipefail flags to be informative
set -Eeuxo pipefail
shopt -s inherit_errexit  # no silent breaking

# This is where we will store Nextclade's dataset for the target pathogen.
NEXTCLADE_DATASET_DIR=nextclade_dataset_bundle
# Inside the dataset, Nextclade uses this file to tag the dataset.
NEXTCLADE_TAG_FILENAME=pathogen.json

# Certain bits of info need to be passed around during the workflow.
# Using JSON file as an easy way to pass them around to various processes.
JOB_INFO_FILE=job_info.json

# Pull sequences from DB and write them out. Capture other necessary info too.
# As part of running, will download the reference dataset for the pathogen.
SEQUENCES_FILE=sequences.fasta
/usr/local/bin/python3.10 /usr/src/app/aspen/workflows/nextclade/prep_samples.py \
  --run-type "${RUN_TYPE}" \
  --pathogen-slug "${PATHOGEN_SLUG}" \
  --sample-ids-file "${SAMPLE_IDS_FILENAME}" \
  --sequences "${SEQUENCES_FILE}" \
  --nextclade-dataset-dir "${NEXTCLADE_DATASET_DIR}" \
  --nextclade-tag-filename "${NEXTCLADE_TAG_FILENAME}" \
  --job-info-file "${JOB_INFO_FILE}"

# In some cases, we discover nothing needs to be done, can exit early.
should_exit_early=$(jq --raw-output ".should_exit_early" "${JOB_INFO_FILE}")
if [ "${should_exit_early}" = true ] ; then
    echo "Unnecessary to keep running workflow, exiting early."
    echo "For reasons behind early exit, see messages from above script."
    echo "Exiting workflow."
    exit 0
fi

echo "Starting nextclade run"
NEXTCLADE_OUTPUT_DIR=output
# Re: `retry-reverse-complement` -- Some pathogens (eg, MPX) frequently need
# the flag to be correctly placed. For other pathogens, it's pointless. But even for
# those pathogens, it should never negatively impact the results, worst
# case is just a bit of unnecessary compute. Easiest to just always have on.
nextclade run \
  --input-dataset "${NEXTCLADE_DATASET_DIR}" \
  --retry-reverse-complement \
  --output-all "${NEXTCLADE_OUTPUT_DIR}" \
  "${SEQUENCES_FILE}"
echo "Nextclade run complete"
nextclade_complete_at=$(date "+%Y-%m-%dT%H:%M:%S")

pathogen_slug=$(jq --raw-output ".pathogen_slug" "${JOB_INFO_FILE}")
# save results back to db
/usr/local/bin/python3.10 /usr/src/app/aspen/workflows/nextclade/save.py \
    --nextclade-csv "${NEXTCLADE_OUTPUT_DIR}/nextclade.csv" \
    --nextclade-aligned-fasta "${NEXTCLADE_OUTPUT_DIR}/nextclade.aligned.fasta" \
    --nextclade-dataset-tag "${NEXTCLADE_DATASET_DIR}/${NEXTCLADE_TAG_FILENAME}" \
    --nextclade-version "$(nextclade --version)" \
    --nextclade-run-datetime "${nextclade_complete_at}" \
    --pathogen-slug "${pathogen_slug}"

echo "Workflow complete"
