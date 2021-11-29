#!/bin/bash

set -Eeuxo pipefail
shopt -s inherit_errexit

df 1>&2
cat /proc/meminfo 1>&2

start_time=$(date +%s)
build_date=$(date +%Y%m%d)

git clone --depth 1 git://github.com/nextstrain/ncov-ingest.git /ncov-ingest
export filename=/ncov-ingest/source-data/location_hierarchy.tsv

aws configure set region $AWS_REGION

# Import locations to the db.
python3 /usr/src/app/aspen/workflows/import_locations/save.py --location-data $filename
