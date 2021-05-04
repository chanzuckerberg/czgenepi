version 1.1

task TransformGisaid {
    input {
        String docker_image_id = "aspen-gisaid"
        String aws_region = "us-west-2"
        String raw_gisaid_object_id
        File raw_gisaid_object
        String db_data_bucket = "aspen-db-data-dev"
    }

    command <<<
    set -Eeuo pipefail
    set -x
    shopt -s inherit_errexit

    aws configure set region ~{aws_region}

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)
    aspen_creation_rev=$(git -C /aspen rev-parse HEAD)
    aspen_workflow_rev=$(git -C /aspen rev-parse HEAD)
    
    ncov_ingest_git_rev=$(git -C /ncov-ingest rev-parse HEAD)

    # decompress the gisaid dataset and transform it.
    zstdmt -d --stdout ~{raw_gisaid_object} > gisaid.ndjson
    /ncov-ingest/bin/transform-gisaid \
        gisaid.ndjson                     \
        --output-metadata metadata.tsv    \
        --output-fasta sequences.fasta    \
        --output-unix-newline

    zstdmt sequences.fasta
    ls -lR

    # upload the files to S3
    bucket=~{db_data_bucket}
    sequences_key=processed_gisaid_dump/"${build_id}"/sequences.fasta.zst
    metadata_key=processed_gisaid_dump/"${build_id}"/metadata.tsv
    aws s3 cp sequences.fasta.zst s3://"${bucket}"/"${sequences_key}"
    aws s3 cp metadata.tsv s3://"${bucket}"/"${metadata_key}"
    end_time=$(date +%s)

    # create the objects
    python3 /aspen/src/backend/aspen/workflows/transform_gisaid/save.py \
            --aspen-workflow-rev "${aspen_workflow_rev}"            \
            --aspen-creation-rev "${aspen_creation_rev}"            \
            --ncov-ingest-rev "${ncov_ingest_git_rev}"              \
            --start-time "${start_time}"                            \
            --end-time "${end_time}"                                \
            --raw-gisaid-object-id "~{raw_gisaid_object_id}"        \
            --gisaid-s3-bucket "${bucket}"                          \
            --gisaid-sequences-s3-key "${sequences_key}"            \
            --gisaid-metadata-s3-key "${metadata_key}" > entity_id
    >>>

    output {
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}
