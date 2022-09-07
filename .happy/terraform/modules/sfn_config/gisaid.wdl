version 1.1

workflow LoadGISAID {
    input {
        String docker_image_id = "genepi-gisaid"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String gisaid_ndjson_url = "https://www.epicov.org/epi3/3p/exp3/export/export.json.bz2"
    }

    call IngestGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        gisaid_ndjson_url = gisaid_ndjson_url
    }

    call TransformGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        raw_gisaid_object_id = IngestGISAID.entity_id,
    }

    call AlignGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        processed_gisaid_object_id = TransformGISAID.entity_id,
    }

    call ImportGISAID {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        gisaid_metadata = AlignGISAID.gisaid_metadata,
    }

    call ImportLocations {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        gisaid_import_complete = ImportGISAID.gisaid_import_complete,
    }

    call ImportLatlongs {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        import_locations_complete = ImportLocations.import_locations_complete,
    }

    call ImportISLs {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        gisaid_import_complete = ImportGISAID.gisaid_import_complete,
    }

    output {
        Array[File] snakemake_logs = AlignGISAID.snakemake_logs
        File align_log = AlignGISAID.align_log
        String ingest_entity_id = IngestGISAID.entity_id
        String transform_entity_id = TransformGISAID.entity_id
        String align_entity_id = AlignGISAID.entity_id
    }
}

task IngestGISAID {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String gisaid_ndjson_url
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)


    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    # fetch genepi config
    genepi_config="$(aws secretsmanager get-secret-value --secret-id ~{genepi_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"
    sequences_key="raw_gisaid_dump/${build_id}/gisaid.ndjson.zst"

    # fetch the gisaid dataset and transform it.
    gisaid_credentials=$(aws secretsmanager get-secret-value --secret-id gisaid-download-credentials --query SecretString --output text)
    gisaid_username=$(echo "${gisaid_credentials}" | jq -r .username)
    gisaid_password=$(echo "${gisaid_credentials}" | jq -r .password)

    wget "~{gisaid_ndjson_url}" --user "${gisaid_username}" --password "${gisaid_password}" --continue --tries=2 -O gisaid_dump.fasta.bz2
    bunzip2 gisaid_dump.fasta.bz2 
    zstdmt gisaid_dump.fasta -o sequences.fasta.zst
    rm gisaid_dump.fasta

    aws s3 cp sequences.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"

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
        String genepi_config_secret_name
        String remote_dev_prefix
        String raw_gisaid_object_id
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    # fetch aspen config
    set +x  # don't echo secrets
    echo "* set \$genepi_config"
    genepi_config="$(aws secretsmanager get-secret-value --secret-id ~{genepi_config_secret_name} --query SecretString --output text)"
    echo "* set \$aspen_s3_db_bucket"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"
    set -x

    # get the bucket/key from the object id
    raw_gisaid_location=$(python3 /usr/src/app/aspen/workflows/transform_gisaid/lookup_raw_gisaid_object.py --raw-gisaid-object-id "~{raw_gisaid_object_id}")
    raw_gisaid_s3_bucket=$(echo "${raw_gisaid_location}" | jq -r .bucket)
    raw_gisaid_s3_key=$(echo "${raw_gisaid_location}" | jq -r .key)

    git clone --depth 1 https://github.com/nextstrain/ncov-ingest /ncov-ingest
    ncov_ingest_git_rev=$(git -C /ncov-ingest rev-parse HEAD)

    # modify location rules from ncov-ingest based on the locations we're using. 
    python3 /usr/src/app/aspen/workflows/transform_gisaid/update_locations.py \
            --input /ncov-ingest/source-data/gisaid_geoLocationRules.tsv      \
            --output /ncov-ingest/source-data/czgenepi_locations.tsv
    mv /ncov-ingest/source-data/czgenepi_locations.tsv \
       /ncov-ingest/source-data/gisaid_geoLocationRules.tsv

    # decompress the gisaid dataset and transform it.
    aws s3 cp --no-progress "s3://${raw_gisaid_s3_bucket}/${raw_gisaid_s3_key}" - | zstdmt -d > gisaid.ndjson
    /ncov-ingest/bin/transform-gisaid     \
        gisaid.ndjson                     \
        --output-metadata metadata.tsv    \
        --output-fasta sequences.fasta    \
        --output-unix-newline

    zstdmt sequences.fasta

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
        String genepi_config_secret_name
        String remote_dev_prefix
        String processed_gisaid_object_id
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # fetch aspen config
    set +x  # don't echo secrets
    echo "* set \$genepi_config"
    genepi_config="$(aws secretsmanager get-secret-value --secret-id ~{genepi_config_secret_name} --query SecretString --output text)"
    echo "* set \$aspen_s3_db_bucket"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"
    set -x

    # get the bucket/key from the object id
    processed_gisaid_location=$(python3 /usr/src/app/aspen/workflows/align_gisaid/lookup_processed_gisaid_object.py --processed-gisaid-object-id "~{processed_gisaid_object_id}")
    processed_gisaid_s3_bucket=$(echo "${processed_gisaid_location}" | jq -r .bucket)
    processed_gisaid_sequences_s3_key=$(echo "${processed_gisaid_location}" | jq -r .sequences_key)
    processed_gisaid_metadata_s3_key=$(echo "${processed_gisaid_location}" | jq -r .metadata_key)

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)
    
    # We're pinning to a specific git hash in the Dockerfile so we're not cloning this here.
    # git clone --depth 1 https://github.com/nextstrain/ncov /ncov
    ncov_git_rev=$(git -C /ncov rev-parse HEAD)

    # fetch the gisaid dataset
    aws s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_sequences_s3_key}" - | zstdmt -d > /ncov/data/sequences.fasta
    aws s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_metadata_s3_key}" /ncov/data/metadata.tsv
    mkdir /ncov/my_profiles/align_gisaid/
    cp /usr/src/app/aspen/workflows/align_gisaid/{builds.yaml,config.yaml} /ncov/my_profiles/align_gisaid/
    # run snakemake, if run fails export the logs from snakemake and ncov to s3 
    (cd /ncov && snakemake --printshellcmds results/aligned_gisaid.fasta.xz results/sanitized_metadata_gisaid.tsv.xz --profile my_profiles/align_gisaid) || { aws s3 cp /ncov/.snakemake/log/ "s3://${aspen_s3_db_bucket}/aligned_gisaid_dump/${build_id}/logs/snakemake/" --recursive ; aws s3 cp /ncov/logs/ "s3://${aspen_s3_db_bucket}/aligned_gisaid_dump/${build_id}/logs/ncov/" --recursive ; }

    mv /ncov/.snakemake/log/*.snakemake.log /ncov/logs/align_gisaid.txt .
    unxz -k /ncov/results/sanitized_metadata_gisaid.tsv.xz  # make an unzipped version for ImportGISAID. The zipped version goes to S3
    mv /ncov/results/sanitized_metadata_gisaid.tsv metadata.tsv  # this is for wdl to pipe into ImportGISAID.

    # upload the files to S3
    sequences_key="aligned_gisaid_dump/${build_id}/aligned_gisaid.fasta.xz"
    metadata_key="aligned_gisaid_dump/${build_id}/sanitized_metadata_gisaid.tsv.xz"
    aws s3 cp /ncov/results/aligned_gisaid.fasta.xz "s3://${aspen_s3_db_bucket}/${sequences_key}"
    aws s3 cp /ncov/results/sanitized_metadata_gisaid.tsv.xz "s3://${aspen_s3_db_bucket}/${metadata_key}"

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
        File gisaid_metadata = "metadata.tsv"
        File align_log = "align_gisaid.txt"
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportGISAID {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        File gisaid_metadata
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_gisaid/save.py       \
            --metadata-file ~{gisaid_metadata} 1>&2
    echo done > gisaid_import_complete
    >>>

    output {
        String gisaid_import_complete = read_string("gisaid_import_complete")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportLocations {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String gisaid_import_complete
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_locations/save.py 1>&2
    echo done > import_locations_complete
    >>>

    output {
        String import_locations_complete = read_string("import_locations_complete")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportLatlongs {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String import_locations_complete
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_location_latlongs/save.py 1>&2
    echo done > import_latlongs_complete
    >>>

    output {
        String import_latlongs_complete = read_string("import_latlongs_complete")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportISLs {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String gisaid_import_complete
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_gisaid_isls/save.py 1>&2
    >>>

    runtime {
        docker: docker_image_id
    }
}
