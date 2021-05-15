version 1.1

workflow LoadGISAID {
    input {
        String docker_image_id = "aspen-gisaid"
        String aws_region = "us-west-2"
        String aspen_config_secret_name
        String remote_dev_prefix = ""
        String gisaid_ndjson_url = "https://www.epicov.org/epi3/3p/exp3/export/export.json.bz2"
        String ndjson_cache_key = "raw_gisaid_dump/dl.zst"
    }

    call RefreshGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        gisaid_ndjson_url = gisaid_ndjson_url,
        ndjson_cache_key = ndjson_cache_key,
    }

    call IngestGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        ndjson_bucket = RefreshGISAID.result_bucket,
        ndjson_cache_key = RefreshGISAID.result_key,
    }

    call TransformGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        raw_gisaid_object_id = IngestGISAID.entity_id,
    }

    call AlignGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        processed_gisaid_object_id = TransformGISAID.entity_id,
    }

    output {
        Array[File] snakemake_logs = AlignGISAID.snakemake_logs
        File align_log = AlignGISAID.align_log
        String ingest_entity_id = IngestGISAID.entity_id
        String transform_entity_id = TransformGISAID.entity_id
        String align_entity_id = AlignGISAID.entity_id
    }
}

task RefreshGISAID {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix
        String gisaid_ndjson_url
        String ndjson_cache_key
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # fetch aspen config
    aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"
    echo "${aspen_s3_db_bucket}" > bucket_name_file

    # fetch the gisaid dataset and transform it.
    gisaid_credentials=$(aws secretsmanager get-secret-value --secret-id gisaid-download-credentials --query SecretString --output text)
    gisaid_username=$(echo "${gisaid_credentials}" | jq -r .username)
    gisaid_password=$(echo "${gisaid_credentials}" | jq -r .password)

    staged_timestamp=0
    if aws s3api head-object --bucket "${aspen_s3_db_bucket}" --key ~{ndjson_cache_key}; then
        staged_timestamp=$(aws s3api head-object --bucket "${aspen_s3_db_bucket}" --key ~{ndjson_cache_key} | jq -r .LastModified)
    fi
    if curl --silent --head --time-cond "$staged_timestamp" "~{gisaid_ndjson_url}" --user "${gisaid_username}:${gisaid_password}" | head -n 1 | grep 304; then
        echo "File at ~{gisaid_ndjson_url} has not been modified since ${staged_timestamp}, nothing to do"
        exit
    fi
    curl "~{gisaid_ndjson_url}" --user "${gisaid_username}:${gisaid_password}" | \
        bunzip2 | \
        zstdmt | \
        aws s3 cp - "s3://${aspen_s3_db_bucket}/~{ndjson_cache_key}"
    >>>

    output {
        String result_bucket = read_string("bucket_name_file")
        String result_key = "~{ndjson_cache_key}"
    }

    runtime {
        docker: docker_image_id
    }
}

task IngestGISAID {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix
        String ndjson_bucket
        String ndjson_cache_key
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA
    sequences_key="raw_gisaid_dump/${build_id}/gisaid.ndjson.zst"

    # fetch aspen config
    aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

    aws s3 cp "s3://~{ndjson_bucket}/~{ndjson_cache_key}" "s3://${aspen_s3_db_bucket}/${sequences_key}"

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/ingest_gisaid/save.py       \
            --aspen-workflow-rev "${aspen_workflow_rev}"             \
            --aspen-creation-rev "${aspen_creation_rev}"             \
            --start-time "${start_time}"                             \
            --end-time "${end_time}"                                 \
            --gisaid-s3-bucket "${aspen_s3_db_bucket}"               \
            --gisaid-s3-key "${sequences_key}" > entity_id
    >>>

    output {
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}

task TransformGISAID {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix
        String raw_gisaid_object_id
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA
    
    # fetch aspen config
    aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

    # get the bucket/key from the object id
    raw_gisaid_location=$(python3 /usr/src/app/aspen/workflows/transform_gisaid/lookup_raw_gisaid_object.py --raw-gisaid-object-id "~{raw_gisaid_object_id}")
    raw_gisaid_s3_bucket=$(echo "${raw_gisaid_location}" | jq -r .bucket)
    raw_gisaid_s3_key=$(echo "${raw_gisaid_location}" | jq -r .key)

    git clone --depth 1 git://github.com/nextstrain/ncov-ingest /ncov-ingest
    ncov_ingest_git_rev=$(git -C /ncov-ingest rev-parse HEAD)

    # decompress the gisaid dataset and transform it.
    aws s3 cp --no-progress "s3://${raw_gisaid_s3_bucket}/${raw_gisaid_s3_key}" - | zstdmt -d > gisaid.ndjson
    /ncov-ingest/bin/transform-gisaid     \
        gisaid.ndjson                     \
        --output-metadata metadata.tsv    \
        --output-fasta sequences.fasta    \
        --output-unix-newline

    zstdmt sequences.fasta
    ls -lR

    # upload the files to S3
    sequences_key="processed_gisaid_dump/${build_id}/sequences.fasta.zst"
    metadata_key="processed_gisaid_dump/${build_id}/metadata.tsv"
    aws s3 cp sequences.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    aws s3 cp metadata.tsv "s3://${aspen_s3_db_bucket}/${metadata_key}"
    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/transform_gisaid/save.py   \
            --aspen-workflow-rev "${aspen_workflow_rev}"            \
            --aspen-creation-rev "${aspen_creation_rev}"            \
            --ncov-ingest-rev "${ncov_ingest_git_rev}"              \
            --start-time "${start_time}"                            \
            --end-time "${end_time}"                                \
            --raw-gisaid-object-id "~{raw_gisaid_object_id}"        \
            --gisaid-s3-bucket "${aspen_s3_db_bucket}"              \
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

task AlignGISAID {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix
        String processed_gisaid_object_id
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # fetch aspen config
    aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

    # get the bucket/key from the object id
    processed_gisaid_location=$(python3 /usr/src/app/aspen/workflows/align_gisaid/lookup_processed_gisaid_object.py --processed-gisaid-object-id "~{processed_gisaid_object_id}")
    processed_gisaid_s3_bucket=$(echo "${processed_gisaid_location}" | jq -r .bucket)
    processed_gisaid_sequences_s3_key=$(echo "${processed_gisaid_location}" | jq -r .sequences_key)
    processed_gisaid_metadata_s3_key=$(echo "${processed_gisaid_location}" | jq -r .metadata_key)

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    # We're pinning to a specific git hash in the Dockerfile so we're not cloning this here.
    # git clone --depth 1 git://github.com/nextstrain/ncov /ncov
    ncov_git_rev=$(git -C /ncov rev-parse HEAD)

    # fetch the gisaid dataset
    aws s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_sequences_s3_key}" - | zstdmt -d > /ncov/data/sequences.fasta
    aws s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_metadata_s3_key}" /ncov/data/metadata.tsv
    mkdir /ncov/my_profiles/align_gisaid/
    cp /usr/src/app/aspen/workflows/align_gisaid/{builds.yaml,config.yaml} /ncov/my_profiles/align_gisaid/
    (cd /ncov; snakemake --printshellcmds results/aligned.fasta --profile my_profiles/align_gisaid 1>&2)

    mv /ncov/.snakemake/log/*.snakemake.log /ncov/logs/align.txt .

    zstdmt /ncov/results/aligned.fasta

    # upload the files to S3
    sequences_key="aligned_gisaid_dump/${build_id}/sequences.fasta.zst"
    metadata_key="aligned_gisaid_dump/${build_id}/metadata.tsv"
    aws s3 cp /ncov/results/aligned.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    aws s3 cp /ncov/data/metadata.tsv "s3://${aspen_s3_db_bucket}/${metadata_key}"

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/align_gisaid/save.py                       \
            --aspen-workflow-rev "${aspen_workflow_rev}"                            \
            --aspen-creation-rev "${aspen_creation_rev}"                            \
            --ncov-rev "${ncov_git_rev}"                                            \
            --aspen-docker-image-version "externally_managed"                       \
            --start-time "${start_time}"                                            \
            --end-time "${end_time}"                                                \
            --processed-gisaid-object-id "~{processed_gisaid_object_id}"            \
            --gisaid-s3-bucket "${aspen_s3_db_bucket}"                              \
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
