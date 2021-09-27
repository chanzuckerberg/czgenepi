set -Eeuxo pipefail
shopt -s inherit_errexit

exit 1

df 1>&2
cat /proc/meminfo 1>&2

start_time=$(date +%s)
build_date=$(date +%Y%m%d)

aws configure set region ~{aws_region}

# fetch aspen config
aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

# set up ncov
mkdir -p ncov/my_profiles/aspen ncov/results
(cd ncov &&
 git init &&
 git fetch --depth 1 git://github.com/nextstrain/ncov.git &&
 git checkout FETCH_HEAD
)
ncov_git_rev=$(cd ncov && git rev-parse HEAD)

cp /usr/src/app/aspen/workflows/nextstrain_run/nextstrain_profile/* ncov/my_profiles/aspen/

# dump the sequences, metadata, and builds.yaml for a run out to disk.
aligned_gisaid_location=$(
    python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py \
           --phylo-run-id "~{workflow_id}"                        \
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

# If this is a contextual build, disable crowding penalty
if grep -q group_plus_context ncov/my_profiles/aspen/builds.yaml; then patch ncov/workflow/snakemake_rules/main_workflow.smk < /usr/src/app/aspen/workflows/nextstrain_run/patches/local_ncov_settings.patch; fi

aligned_gisaid_s3_bucket=$(echo "${aligned_gisaid_location}" | jq -r .bucket)
aligned_gisaid_sequences_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .sequences_key)
aligned_gisaid_metadata_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .metadata_key)

# fetch the gisaid dataset
aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_sequences_s3_key}" - | zstdmt -d | xz -2 > ncov/results/aligned_gisaid.fasta.xz
aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_metadata_s3_key}" ncov/data/metadata_gisaid.tsv

(cd ncov && snakemake --printshellcmds auspice/ncov_aspen.json --profile my_profiles/aspen/ --resources=mem_mb=312320) || aws s3 cp ncov/.snakemake/log/ "s3://${aspen_s3_db_bucket}/phylo_run/${build_date}/~{s3_filestem}/~{workflow_id}/logs/" --recursive

# upload the tree to S3
key="phylo_run/${build_date}/~{s3_filestem}/~{workflow_id}/ncov.json"
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
    --phylo-run-id "~{workflow_id}"                                         \
    --bucket "${aspen_s3_db_bucket}"                                        \
    --key "${key}"                                                          \
    --tree-path ncov/auspice/ncov_aspen.json                                \