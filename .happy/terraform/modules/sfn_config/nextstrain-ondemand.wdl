version 1.1

workflow nextstrain {

    input {
        String docker_image_id = "genepi-nextstrain"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        Int    workflow_id
        String s3_filestem
    }

    call nextstrain_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        workflow_id = workflow_id,
        s3_filestem = s3_filestem,
    }
}


task nextstrain_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        Int    workflow_id
        String s3_filestem
    }

    command <<<
    set -Euxo pipefail
    # setup
    export AWS_REGION="~{aws_region}"
    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    export WORKFLOW_ID="~{workflow_id}"
    export S3_FILESTEM="~{s3_filestem}"

    # Just in case the run script bails out before defining this var
    ncov_git_rev=""

    # run main workflow
    /usr/src/app/aspen/workflows/nextstrain_run/run_nextstrain_ondemand.sh

    # error handling
    if [[ $? != 0 ]]; then
        end_time=$(date +%s)

        # collect any recoverable information from the main workflow
        if [[ -e /tmp/ncov_git_rev ]]; then ncov_git_rev=$(cat /tmp/ncov_git_rev); fi

        python3 /usr/src/app/aspen/workflows/nextstrain_run/error.py            \
        --ncov-rev "${ncov_git_rev}"                                            \
        --end-time "${end_time}"                                                \
        --phylo-run-id "~{workflow_id}"                                         \

        exit 1
    fi
    >>>

    runtime {
        docker: docker_image_id
    }
}
