#!/bin/bash

# TODO: fix pipefail flags to be informative
set -Eeuxo pipefail
shopt -s inherit_errexit  # no silent breaking

# activate miniconda
# eval "$($HOME/miniconda/bin/conda shell.bash hook)"
# conda init

# touch sequences.fasta
# sequences_output="sequences.fasta"
# cp /usr/src/app/aspen/workflows/pangolin/export.py .
# # export sequences
# /usr/local/bin/python3.10 export.py \
#   --sample-ids-file $SAMPLE_IDS_FILE \
#   --sequences sequences.fasta \
#   --fasta-identifier-type public_identifier

# # run nextclade
# nextclade dataset get --name $NEXTCLADE_DATASET_NAME --output-dir output/bundle
# nextclade run --input-dataset output/bundle --output-all=output sequences.fasta

# save results back to db
export NEXTCLADE_VERSION=$(nextclade --version)
/usr/local/bin/python3.10 save.py \
    --nextclade-csv output/nextclade.csv \
    --nextclade-version "$NEXTCLADE_VERSION" \
    --group-name $GROUP_NAME \
    --pathogen-slug $PATHOGEN_SLUG
# 