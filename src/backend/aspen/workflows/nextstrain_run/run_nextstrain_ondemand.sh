#!/bin/bash

# WDL inputs available through environmental vars:
# AWS_REGION
# ASPEN_CONFIG_SECRET_NAME
# REMOTE_DEV_PREFIX (if set)
# WORKFLOW_ID
# S3_FILESTEM

set -Eeuxo pipefail
shopt -s inherit_errexit

df 1>&2
cat /proc/meminfo 1>&2

start_time=$(date +%s)
build_date=$(date +%Y%m%d)

aws configure set region $AWS_REGION

# fetch aspen config
aspen_config="$(aws secretsmanager get-secret-value --secret-id $ASPEN_CONFIG_SECRET_NAME --query SecretString --output text)"
aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

# set up ncov
mkdir -p ncov/my_profiles/aspen ncov/results
ncov_git_rev=$(cd ncov && git rev-parse HEAD)
echo "${ncov_git_rev}" >| "/tmp/ncov_git_rev"

cp /usr/src/app/aspen/workflows/nextstrain_run/nextstrain_profile/* ncov/my_profiles/aspen/

# dump the sequences, metadata, and builds.yaml for a run out to disk.
aligned_gisaid_location=$(
    python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py \
           --phylo-run-id "${WORKFLOW_ID}"                        \
           --county-sequences ncov/data/sequences_aspen.fasta     \
           --county-metadata ncov/data/metadata_aspen.tsv         \
           --selected ncov/data/include.txt                       \
           --builds-file ncov/my_profiles/aspen/builds.yaml       \
)
# If we don't have any county samples, copy the reference genomes to to our county file
if [ ! -e ncov/data/sequences_aspen.fasta ]; then
    cp ncov/data/references_sequences.fasta ncov/data/sequences_aspen.fasta;
    cp ncov/data/references_metadata.tsv ncov/data/metadata_aspen.tsv;
fi;

aligned_gisaid_s3_bucket=$(echo "${aligned_gisaid_location}" | jq -r .bucket)
aligned_gisaid_sequences_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .sequences_key)
aligned_gisaid_metadata_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .metadata_key)

# fetch the gisaid dataset
aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_sequences_s3_key}" ncov/results/
aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_metadata_s3_key}" ncov/results/

# run snakemake, if run fails export the logs from snakemake and ncov to s3 
(cd ncov && snakemake --printshellcmds auspice/ncov_aspen.json --profile my_profiles/aspen/ --resources=mem_mb=312320) || { aws s3 cp ncov/.snakemake/log/ "s3://${aspen_s3_db_bucket}/phylo_run/${build_date}/${S3_FILESTEM}/${WORKFLOW_ID}/logs/snakemake/" --recursive ; aws s3 cp ncov/logs/ "s3://${aspen_s3_db_bucket}/phylo_run/${build_date}/${S3_FILESTEM}/${WORKFLOW_ID}/logs/ncov/" --recursive ; }

# upload the tree to S3
key="phylo_run/${build_date}/${S3_FILESTEM}/${WORKFLOW_ID}/ncov.json"
aws s3 cp ncov/auspice/ncov_aspen.json "s3://${aspen_s3_db_bucket}/${key}"

# update aspen
aspen_workflow_rev=WHATEVER
aspen_creation_rev=WHATEVER

end_time=$(date +%s)

# create the objects
python3 /usr/src/app/aspen/workflows/nextstrain_run/save.py                 \
    --aspen-workflow-rev "${aspen_workflow_rev}"                            \
    --aspen-creation-rev "${aspen_creation_rev}"                            \
    --ncov-rev "${ncov_git_rev}"                                            \
    --aspen-docker-image-version ""                                         \
    --end-time "${end_time}"                                                \
    --phylo-run-id "${WORKFLOW_ID}"                                         \
    --bucket "${aspen_s3_db_bucket}"                                        \
    --key "${key}"                                                          \
    --tree-path ncov/auspice/ncov_aspen.json                                \
