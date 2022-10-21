#!/bin/bash

# TODO: fix pipefail flags to be informative
set -Eeuxo pipefail
shopt -s inherit_errexit  # no silent breaking

# activate miniconda
eval "$($HOME/miniconda/bin/conda shell.bash hook)"
conda init
conda activate pangolin

# check pangolin is present:
pangolin -pv

sequences_output="sequences.fasta"

cd /usr/src/app/aspen/workflows/pangolin
# call export script to export renamed sequences
/usr/local/bin/python3.9 export.py \
  --sample-ids-file "$SAMPLE_IDS_FILE" \
  --sequences "$sequences_output"

# call pangolin on the exported sequences
lineage_report="lineage_report.csv"
pangolin --threads 16 $sequences_output --outfile "$lineage_report"

last_updated=$(date +'%m-%d-%Y')
# save the pangolin results back to the db:
/usr/local/bin/python3.9 save.py \
  --pangolin-csv "$lineage_report" \
  --pangolin-last-updated "$last_updated"
