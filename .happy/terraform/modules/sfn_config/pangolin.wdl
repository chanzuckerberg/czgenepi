version 1.1

workflow pangolin {
    input {
        String docker_image_id = "pangolin:latest"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
    }

    call pangolin_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
    }

    call pango_lineages_loading {
        input:
        docker_image_id = docker_image_id,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
    }
}

task pangolin_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
    }

    command <<<
    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    set -Euxo pipefail
    export SAMPLE_IDS_FILE="${HOME}/sample_ids.txt"

    cd /usr/src/app/aspen/workflows/pangolin
    /usr/local/bin/python3.9 find_samples.py --output-file "${SAMPLE_IDS_FILE}"
    ./run_pangolin.sh
    >>>

    runtime {
        docker: docker_image_id
    }
}

task pango_lineages_loading {
    input {
        String docker_image_id
        String genepi_config_secret_name
        String remote_dev_prefix
    }

    command <<<
    # All the `1>&2` below is so miniwdl will log our messages since stdout
    # is effectively ignored in preference of only logging stderr
    echo "Starting task for loading Pango lineages" 1>&2

    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    genepi_config="$(aws secretsmanager get-secret-value --secret-id ~{genepi_config_secret_name} --query SecretString --output text)"
    export ASPEN_S3_DB_BUCKET="$(jq -r .S3_db_bucket <<< "$genepi_config")"

    cd /usr/src/app/aspen/workflows/import_pango_lineages
    ./entrypoint.sh 1>&2
    >>>

    runtime {
        docker: docker_image_id
    }
}
