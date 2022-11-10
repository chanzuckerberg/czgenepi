#!/bin/bash

# TODO: fix pipefail flags to be informative
set -Eeuxo pipefail
shopt -s inherit_errexit  # no silent breaking

# Pull sequences from DB and write them out. Capture other necessary info too.
/usr/local/bin/python3.10 /usr/src/app/aspen/workflows/nextclade/prep_samples.py \
  --sample-ids-file $SAMPLE_IDS_FILE \
  --sequences sequences.fasta \
  --pathogen-info-file pathogen_info.json

# run nextclade
nextclade dataset get --name $NEXTCLADE_DATASET_NAME --output-dir output/bundle
nextclade run --input-dataset output/bundle --output-all=output sequences.fasta

# save results back to db
export NEXTCLADE_VERSION=$(nextclade --version)
/usr/local/bin/python3.10 save.py \
    --nextclade-csv output/nextclade.csv \
    --nextclade-version "$NEXTCLADE_VERSION" \
    --group-name $GROUP_NAME \
    --pathogen-slug $PATHOGEN_SLUG
