version 1.1

workflow LoadGenBankMPX {
    input {
        String docker_image_id = "genepi-gisaid"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String genbank_metadata_url = "https://data.nextstrain.org/files/workflows/monkeypox/metadata.tsv.gz"
        String genbank_alignment_url = "https://data.nextstrain.org/files/workflows/monkeypox/alignment.fasta.xz"
    }

    call IngestGenBankMPX {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_sequences_url = genbank_sequences_url,
        genbank_alignment_url = genbank_alignment_url,
    }

    call TransformGenBankMPX {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_metadata_url = genbank_metadata_url,
        raw_genbank_object_id = IngestGenBankMPX.entity_id,
    }

    call AlignGenBankMPX {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        processed_gisaid_object_id = TransformGenBankMPX.entity_id,
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

    output {
        Array[File] snakemake_logs = AlignGISAID.snakemake_logs
        File align_log = AlignGISAID.align_log
        String ingest_entity_id = IngestGISAID.entity_id
        String transform_entity_id = TransformGISAID.entity_id
        String align_entity_id = AlignGISAID.entity_id
    }
}

task IngestGenBankMPX {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String genbank_alignment_url
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

    # S3 target locations
    metadata_key="raw_nextstrain_mpx_dump/${build_id}/metadata.tsv.zst"
    alignment_key="raw_nextstrain_mpx_dump/${build_id}/aligntment.fasta.zst"

    # fetch the nextstrain mpx sequences and save them to s3.
    wget "~{genbank_sequences_url}" --continue --tries=2 -O sequences.fasta.xz
    xzcat sequences.fasta.xz | zstd -o sequences.fasta.zst
    ${aws} s3 cp sequences.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    rm sequences.fasta.xz

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/ingest_raw_sequences/save.py       \
            --start-time "${start_time}"                             \
            --gisaid-s3-bucket "${aspen_s3_db_bucket}"               \
            --gisaid-s3-key "${sequences_key}" > entity_id           \
            --pathogen "MPX"                                         \
            --public_repository "GenBank"
    >>>

    output {
        String entity_id = read_string("entity_id")
    }

    runtime {
        docker: docker_image_id
    }
}

task TransformGenBankMPX {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String genbank_metadata_url
        String raw_genbank_object_id
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
    raw_genbank_location=$(python3 /usr/src/app/aspen/workflows/transform_sequences/lookup_raw_download_object.py --raw-download-object-id "~{raw_genbank_object_id}")
    raw_genbank_s3_bucket=$(echo "${raw_genbank_location}" | jq -r .bucket)
    raw_genbank_s3_key=$(echo "${raw_genbank_location}" | jq -r .key)

    # fetch the genbank mpx metadata on nextstrain.
    wget "~{genbank_metadata_url}" --continue --tries=2 -O metadata.tsv.gz
    gunzip metadata.tsv.gz


    # decompress the genbank dataset and remove sequences not found in the metadata.
    ${aws} s3 cp --no-progress "s3://${raw_genbank_s3_bucket}/${raw_genbank_s3_key}" - | zstdmt -d > raw_sequences.fasta

    python3 /usr/src/app/aspen/workflows/transform_sequences/prune.py   \
            --metadata-file "metadata.tsv"                              \
            --sequences-file "raw_sequences.fasta"

    # compress processed sequences
    zstd raw_sequences.fasta -o sequences.fasta.zst


    # upload the files to S3
    sequences_key="processed_genbank_dump/${build_id}/sequences.fasta.zst"
    metadata_key="processed_genbank_dump/${build_id}/metadata.tsv"
    ${aws} s3 cp sequences.fasta.zst "s3://${aspen_s3_db_bucket}/${sequences_key}"
    ${aws} s3 cp metadata.tsv "s3://${aspen_s3_db_bucket}/${metadata_key}"
    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/transform_sequences/save.py   \
            --aspen-workflow-rev "${aspen_workflow_rev}"            \
            --aspen-creation-rev "${aspen_creation_rev}"            \
            --ncov-ingest-rev "${ncov_ingest_git_rev}"              \
            --start-time "${start_time}"                            \
            --end-time "${end_time}"                                \
            --raw-gisaid-object-id "~{raw_genbank_object_id}"        \
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

task AlignGenBankMPX {
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
    source /usr/src/app/aspen/workflows/wdl_setup.sh

    # get the bucket/key from the object id
    processed_gisaid_location=$(python3 /usr/src/app/aspen/workflows/align_gisaid/lookup_processed_repo_data_object.py --processed-object-id "~{processed_gisaid_object_id}")
    processed_gisaid_s3_bucket=$(echo "${processed_gisaid_location}" | jq -r .bucket)
    processed_gisaid_sequences_s3_key=$(echo "${processed_gisaid_location}" | jq -r .sequences_key)
    processed_gisaid_metadata_s3_key=$(echo "${processed_gisaid_location}" | jq -r .metadata_key)

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    # We're pinning to a specific git hash in the Dockerfile so we're not cloning this here.
    # git clone --depth 1 https://github.com/nextstrain/ncov /ncov
    ncov_git_rev=$(git -C /ncov rev-parse HEAD)

    # fetch the nextstrain mpx alignment and save it to s3.
    wget "~{genbank_alignment_url}" --continue --tries=2 -O alignment.fasta.xz
    xzcat alignment.fasta.xz | zstd -o alignment.fasta.zst
    ${aws} s3 cp alignment.fasta.zst "s3://${aspen_s3_db_bucket}/${alignment_key}"
    rm alignment.fasta.xz

    # fetch the gisaid dataset
    ${aws} s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_sequences_s3_key}" - | zstdmt -d > /ncov/data/sequences.fasta
    ${aws} s3 cp --no-progress "s3://${processed_gisaid_s3_bucket}/${processed_gisaid_metadata_s3_key}" /ncov/data/metadata.tsv
    mkdir /ncov/my_profiles/align_gisaid/
    cp /usr/src/app/aspen/workflows/align_gisaid/{builds.yaml,config.yaml} /ncov/my_profiles/align_gisaid/
    # run snakemake, if run fails export the logs from snakemake and ncov to s3 
    (cd /ncov && snakemake --printshellcmds results/aligned_gisaid.fasta.xz results/sanitized_metadata_gisaid.tsv.xz --profile my_profiles/align_gisaid) || { ${aws} s3 cp /ncov/.snakemake/log/ "s3://${aspen_s3_db_bucket}/aligned_gisaid_dump/${build_id}/logs/snakemake/" --recursive ; ${aws} s3 cp /ncov/logs/ "s3://${aspen_s3_db_bucket}/aligned_gisaid_dump/${build_id}/logs/ncov/" --recursive ; }

    mv /ncov/.snakemake/log/*.snakemake.log /ncov/logs/align_gisaid.txt .
    unxz -k /ncov/results/sanitized_metadata_gisaid.tsv.xz  # make an unzipped version for ImportGISAID. The zipped version goes to S3
    mv /ncov/results/sanitized_metadata_gisaid.tsv metadata.tsv  # this is for wdl to pipe into ImportGISAID.

    # upload the files to S3
    sequences_key="aligned_gisaid_dump/${build_id}/aligned_gisaid.fasta.xz"
    metadata_key="aligned_gisaid_dump/${build_id}/sanitized_metadata_gisaid.tsv.xz"
    ${aws} s3 cp /ncov/results/aligned_gisaid.fasta.xz "s3://${aspen_s3_db_bucket}/${sequences_key}"
    ${aws} s3 cp /ncov/results/sanitized_metadata_gisaid.tsv.xz "s3://${aspen_s3_db_bucket}/${metadata_key}"

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
    python3 /usr/src/app/aspen/workflows/import_locations/save.py --pathogen MPX 1>&2
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
