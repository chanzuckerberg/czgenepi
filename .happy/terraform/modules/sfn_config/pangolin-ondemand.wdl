version 1.1

workflow pangolin {
    input {
        String docker_image_id = "genepi-pangolin:latest"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        Array[String] samples
    }
    call pangolin_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        samples = samples,
    }
}

task pangolin_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix 
        Array[String] samples
    }

    command <<<
    export AWS_REGION="~{aws_region}"
    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    set -Euxo pipefail
    export SAMPLE_IDS_FILE="${HOME}/sample_ids.txt"

    cd /usr/src/app/aspen/workflows/pangolin
    echo "Writing sample ids to file."
    set +x
    echo "~{sep('\n', samples)}" > $SAMPLE_IDS_FILE
    set -x
    ./run_pangolin.sh
    >>>

    runtime {
        docker: docker_image_id
    }
}

