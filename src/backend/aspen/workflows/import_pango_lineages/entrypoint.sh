#!/bin/bash

# WDL inputs available through environmental vars:
# TODO

# Any failure in script should break the whole thing.
set -Eeuxo pipefail
shopt -s inherit_errexit

# Talking to Pangolin folks, they said the best canonical listing of all
# current lineages is to use their (manually updated) lineage_notes.txt
# https://github.com/cov-lineages/pango-designation/issues/456
CANONICAL_LINEAGES_LOCATION="https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt"

# Track when pulled so we can keep records
current_datetime=$(date "+%F_%H%M%z")
filename="${current_datetime}_lineage_notes.txt"

wget -O $filename $CANONICAL_LINEAGES_LOCATION

# We upload copy to S3 for record keeping, but unused otherwise
# TODO aws s3 cp etc etc

# Parse lineages file and load into DB
python3 ./import.py --lineages-file $filename
