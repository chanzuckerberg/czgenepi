version 1.1

task AlignGisaid {
    input {
        String docker_image_id = "aspen-gisaid"
        String aws_region = "us-west-2"
        String processed_gisaid_object_id
        String db_data_bucket = "aspen-db-data-dev"
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    aws configure set region ~{aws_region}

    # get the bucket/key from the object id
    processed_gisaid_location=$(python3 /aspen/src/backend/aspen/workflows/align_gisaid/lookup_processed_gisaid_object.py --processed-gisaid-object-id "~{processed_gisaid_object_id}")
    processed_gisaid_s3_bucket=$(echo "${processed_gisaid_location}" | jq -r .bucket)
    processed_gisaid_sequences_s3_key=$(echo "${processed_gisaid_location}" | jq -r .sequences_key)
    processed_gisaid_metadata_s3_key=$(echo "${processed_gisaid_location}" | jq -r .metadata_key)

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    ncov_git_rev=$(git -C /ncov rev-parse HEAD)

    # fetch the gisaid dataset
    aws s3 cp --no-progress s3://"${processed_gisaid_s3_bucket}"/"${processed_gisaid_sequences_s3_key}" - | zstdmt -d > /ncov/data/sequences.fasta
    aws s3 cp --no-progress s3://"${processed_gisaid_s3_bucket}"/"${processed_gisaid_metadata_s3_key}" /ncov/data/metadata.tsv
    (cd /ncov; snakemake --printshellcmds results/aligned.fasta --profile my_profiles/align/ 1>&2)

    mv /ncov/.snakemake/log/*.snakemake.log /ncov/logs/align.txt .

    zstdmt /ncov/results/aligned.fasta

    # upload the files to S3
    bucket="~{db_data_bucket}"
    sequences_key=aligned_gisaid_dump/"${build_id}"/sequences.fasta.zst
    metadata_key=aligned_gisaid_dump/"${build_id}"/metadata.tsv
    aws s3 cp /ncov/results/aligned.fasta.zst s3://"${bucket}"/"${sequences_key}"
    aws s3 cp /ncov/data/metadata.tsv s3://"${bucket}"/"${metadata_key}"

    aspen_creation_rev=$(git -C /aspen rev-parse HEAD)
    aspen_workflow_rev=$(git -C /aspen rev-parse HEAD)

    end_time=$(date +%s)

    # create the objects
    python3 /aspen/src/backend/aspen/workflows/align_gisaid/save.py                 \
            --aspen-workflow-rev "${aspen_workflow_rev}"                            \
            --aspen-creation-rev "${aspen_creation_rev}"                            \
            --ncov-rev "${ncov_git_rev}"                                            \
            --aspen-docker-image-version "externally_managed"                       \
            --start-time "${start_time}"                                            \
            --end-time "${end_time}"                                                \
            --processed-gisaid-object-id "~{processed_gisaid_object_id}"            \
            --gisaid-s3-bucket "${bucket}"                                          \
            --gisaid-sequences-s3-key "${sequences_key}"                            \
            --gisaid-metadata-s3-key "${metadata_key}" > entity_id
    >>>

    output {
        Array[File] snakemake_logs = glob("*.snakemake.log")
        File align_log = "align.txt"
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}
