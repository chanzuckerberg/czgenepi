version 1.1

workflow nextstrain {

    input {
        String docker_image_id = "genepi-backend"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String deployment_stage
    }

    call nextstrain_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        deployment_stage = deployment_stage
    }
}


task nextstrain_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String deployment_stage
    }

    command <<<
    set -Euo pipefail
    # secrets
    echo "export GENEPI_CONFIG_SECRET_NAME"
    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    # setup
    set -x
    export AWS_REGION="~{aws_region}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    export DEPLOYMENT_STAGE="~{deployment_stage}"

    # Just in case the run script bails out before defining these vars
    ncov_git_rev=""

    # run main workflow
    /usr/src/app/aspen/workflows/nextstrain_run/run_nextstrain_autorun.sh

    # error handling
    if [[ $? != 0 ]]; then
        exit 1
    fi
    >>>

    runtime {
        docker: docker_image_id
    }
}
