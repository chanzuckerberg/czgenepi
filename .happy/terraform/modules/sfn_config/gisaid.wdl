version 1.1

workflow LoadGISAID {
    input {
        String docker_image_id = "genepi-gisaid"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
	# TODO we should be able to fetch from S3 but something's not working right
        # String upstream_ndjson_url = "s3://nextstrain-data/files/ncov/open/genbank.ndjson.zst"
        # String upstream_aligned_url = "s3://nextstrain-data/files/ncov/open/aligned.fasta.xz"
        String upstream_ndjson_url = "https://data.nextstrain.org/files/ncov/open/genbank.ndjson.zst"
        String upstream_aligned_url = "https://data.nextstrain.org/files/ncov/open/aligned.fasta.xz"
    }

    call IngestRepoData {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        upstream_ndjson_url = upstream_ndjson_url
    }

    call TransformRepoData {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        raw_repo_entity_id = IngestRepoData.entity_id,
    }

    call SaveAlignedData {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        transformed_metadata_entity_id = TransformRepoData.entity_id,
	upstream_aligned_url = upstream_aligned_url,
    }

    call ImportMetadata {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        repo_metadata = SaveAlignedData.repo_metadata,
    }

    call ImportLocations {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        repo_import_complete = ImportMetadata.repo_import_complete,
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
        repo_import_complete = ImportMetadata.repo_import_complete,
    }

    output {
        Array[File] snakemake_logs = SaveAlignedData.snakemake_logs
        File align_log = SaveAlignedData.align_log
        String ingest_entity_id = IngestRepoData.entity_id
        String transform_entity_id = TransformRepoData.entity_id
        String align_entity_id = SaveAlignedData.entity_id
    }
}

task IngestRepoData {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String upstream_ndjson_url
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
    source /usr/src/app/aspen/workflows/wdl_setup.sh

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    # Set our destination key
    sequences_key="raw_genbank_dump/${build_id}/genbank.ndjson.zst"

    # fetch the genbank dataset and transform it.
    # ${aws} s3 cp "~{upstream_ndjson_url}" genbank.ndjson.zst
    # ${aws} s3 cp genbank.ndjson.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    wget -nv -O genbank.ndjson.zst "~{upstream_ndjson_url}"
    ${aws} s3 cp genbank.ndjson.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/ingest_gisaid/save.py       \
            --start-time "${start_time}"                             \
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

task TransformRepoData {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String raw_repo_entity_id
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
    source /usr/src/app/aspen/workflows/wdl_setup.sh

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    # get the bucket/key from the object id
    raw_data_location=$(python3 /usr/src/app/aspen/workflows/transform_gisaid/lookup_raw_download_object.py --raw-download-object-id "~{raw_repo_entity_id}")
    raw_data_s3_bucket=$(echo "${raw_data_location}" | jq -r .bucket)
    raw_data_s3_key=$(echo "${raw_data_location}" | jq -r .key)

    git clone --depth 1 https://github.com/nextstrain/ncov-ingest /ncov-ingest
    ncov_ingest_git_rev=$(git -C /ncov-ingest rev-parse HEAD)

    # modify location rules from ncov-ingest based on the locations we're using. 
    python3 /usr/src/app/aspen/workflows/transform_gisaid/update_locations.py \
            --input /ncov-ingest/source-data/gisaid_geoLocationRules.tsv      \
            --output /ncov-ingest/source-data/czgenepi_locations.tsv
    mv /ncov-ingest/source-data/czgenepi_locations.tsv \
       /ncov-ingest/source-data/gisaid_geoLocationRules.tsv

    # decompress the raw dataset and transform it.
    ${aws} s3 cp --no-progress "s3://${raw_data_s3_bucket}/${raw_data_s3_key}" - | zstdmt -d > genbank.ndjson
    /ncov-ingest/bin/transform-genbank    \
        genbank.ndjson                    \
        --output-metadata metadata.tsv    \
        --output-fasta sequences.fasta    \
        --biosample=""                    \
        --output-unix-newline

    zstdmt sequences.fasta
    xz metadata.tsv

    # upload the files to S3
    sequences_key="processed_genbank_dump/${build_id}/sequences.fasta.zst"
    metadata_key="processed_genbank_dump/${build_id}/metadata.tsv.xz"
    ${aws} s3 cp --no-progress sequences.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    ${aws} s3 cp --no-progress metadata.tsv.xz "s3://${aspen_s3_db_bucket}/${metadata_key}"
    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/transform_gisaid/save.py   \
            --aspen-workflow-rev "${aspen_workflow_rev}"            \
            --aspen-creation-rev "${aspen_creation_rev}"            \
            --ncov-ingest-rev "${ncov_ingest_git_rev}"              \
            --start-time "${start_time}"                            \
            --end-time "${end_time}"                                \
            --raw-gisaid-object-id "~{raw_repo_entity_id}"          \
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

task SaveAlignedData {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String transformed_metadata_entity_id
	String upstream_aligned_url
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
    source /usr/src/app/aspen/workflows/wdl_setup.sh

    # get the bucket/key from the object id
    processed_genbank_location=$(python3 /usr/src/app/aspen/workflows/align_gisaid/lookup_processed_repo_data_object.py --processed-object-id "~{transformed_metadata_entity_id}")
    processed_genbank_s3_bucket=$(echo "${processed_genbank_location}" | jq -r .bucket)
    transformed_metadata_s3_key=$(echo "${processed_genbank_location}" | jq -r .metadata_key)

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)
    
    # We're pinning to a specific git hash in the Dockerfile so we're not cloning this here.
    # git clone --depth 1 https://github.com/nextstrain/ncov /ncov
    ncov_git_rev=$(git -C /ncov rev-parse HEAD)

    # fetch the upstream repo dataset
    ${aws} s3 cp --no-progress "s3://${processed_genbank_s3_bucket}/${transformed_metadata_s3_key}" /ncov/data/metadata.tsv.xz
    # ${aws} s3 cp --no-progress "~{upstream_aligned_url}" aligned.fasta.xz
    wget -nv -O aligned.fasta.xz "~{upstream_aligned_url}"

    # Transform gisaid metadata only! Don't re-run alignment!
    unxz -k /ncov/data/metadata.tsv.xz
    mkdir /ncov/my_profiles/align_genbank/
    cp /usr/src/app/aspen/workflows/align_gisaid/{builds.yaml,config.yaml} /ncov/my_profiles/align_genbank/

    # run snakemake, if run fails export the logs from snakemake and ncov to s3
    (cd /ncov && snakemake --printshellcmds results/sanitized_metadata_genbank.tsv.xz --profile my_profiles/align_genbank) || { ${aws} s3 cp /ncov/.snakemake/log/ "s3://${aspen_s3_db_bucket}/aligned_genbank_dump/${build_id}/logs/snakemake/" --recursive ; ${aws} s3 cp /ncov/logs/ "s3://${aspen_s3_db_bucket}/aligned_genbank_dump/${build_id}/logs/ncov/" --recursive ; }

    # upload the files to S3
    sequences_key="aligned_genbank_dump/${build_id}/aligned_genbank.fasta.xz"
    metadata_key="aligned_genbank_dump/${build_id}/sanitized_metadata_genbank.tsv.xz"
    ${aws} s3 cp aligned.fasta.xz "s3://${aspen_s3_db_bucket}/${sequences_key}"
    ${aws} s3 cp /ncov/results/sanitized_metadata_genbank.tsv.xz "s3://${aspen_s3_db_bucket}/${metadata_key}"

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
            --processed-gisaid-object-id "~{transformed_metadata_entity_id}"        \
            --gisaid-s3-bucket "${aspen_s3_db_bucket}"                              \
            --gisaid-sequences-s3-key "${sequences_key}"                            \
            --gisaid-metadata-s3-key "${metadata_key}" > entity_id
    >>>

    output {
        Array[File] snakemake_logs = glob("*.snakemake.log")
        File repo_metadata = "metadata.tsv.xz"
        File align_log = "align_genbank.txt"
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportMetadata {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        File repo_metadata
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
            --metadata-file ~{repo_metadata} 1>&2
    echo done > repo_import_complete
    >>>

    output {
        String repo_import_complete = read_string("repo_import_complete")
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
        String repo_import_complete
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
        String repo_import_complete
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
