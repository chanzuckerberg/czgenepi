#!/bin/bash

# WDL inputs available through environmental vars:
# AWS_REGION
# GENEPI_CONFIG_SECRET_NAME
# REMOTE_DEV_PREFIX (if set)
# DEPLOYMENT_STAGE

set -Eeuxo pipefail
shopt -s inherit_errexit

df 1>&2
cat /proc/meminfo 1>&2

start_time=$(date +%s)

aws configure set region $AWS_REGION

if [ -n "${BOTO_ENDPOINT_URL-}" ]; then
  export aws="aws --endpoint-url ${BOTO_ENDPOINT_URL}"
else
  export aws="aws"
fi

# fetch aspen config
set +x  # don't echo secrets
echo "* set \$genepi_config (not printing value because contains secrets)"
genepi_config="$($aws secretsmanager get-secret-value --secret-id $GENEPI_CONFIG_SECRET_NAME --query SecretString --output text)"
echo "* set \$aspen_s3_db_bucket"
aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"
set -x

python3 /usr/src/app/aspen/workflows/nextstrain_run/create_phyloruns.py launch-all