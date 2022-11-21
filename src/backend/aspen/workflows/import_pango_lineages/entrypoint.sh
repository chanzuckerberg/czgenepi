#!/bin/bash

# Environmental vars required for script to run (should be set by WDL kickoff)
# GENEPI_CONFIG_SECRET_NAME (direct from WDL input)
# REMOTE_DEV_PREFIX (direct from WDL input)
# ASPEN_S3_DB_BUCKET (loaded from genepi_config)

# Any failure in script should break the whole thing.
set -Eeuxo pipefail
shopt -s inherit_errexit

if [ -n "${BOTO_ENDPOINT_URL-}" ]; then
  export aws="aws --endpoint-url ${BOTO_ENDPOINT_URL}"
else
  export aws="aws"
fi

# Talking to Pangolin folks, they said the best canonical listing of all
# current lineages is to use their (manually updated) lineage_notes.txt
# https://github.com/cov-lineages/pango-designation/issues/456
CANONICAL_LINEAGES_LOCATION="https://raw.githubusercontent.com/cov-lineages/pango-designation/master/lineage_notes.txt"

# Track when pulled so we can keep records
current_datetime=$(date "+%F_%H%M%z")
filename="${current_datetime}_lineage_notes.txt"

echo "Downloading Pango lineages file"
wget -O $filename $CANONICAL_LINEAGES_LOCATION

# We upload copy to S3 for record keeping, but unused otherwise
echo "Uploading a backup copy to S3"
lineages_key="pangolin_lineages/${filename}"
s3_destination="s3://${ASPEN_S3_DB_BUCKET}/${lineages_key}"
$aws s3 cp $filename $s3_destination

# Parse lineages file and load into DB
python3 ./load_lineages.py --lineages-file $filename
