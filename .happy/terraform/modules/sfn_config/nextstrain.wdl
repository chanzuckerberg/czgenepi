version 1.1

workflow nextstrain {

    input {
        String docker_image_id = "aspen-nextstrain"
        String aws_region = "us-west-2"
        String aspen_config_secret_name
        String remote_dev_prefix = ""
        String group_name
        String s3_filestem
        String template_filename
        Map[String, String] template_args
        String tree_type
    }

    call nextstrain_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        group_name = group_name,
        s3_filestem = s3_filestem,
        template_filename = template_filename,
        template_args = template_args,
        tree_type = tree_type
    }
}


task nextstrain_workflow {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix
        String group_name
        String s3_filestem
        String template_filename
        Map[String, String] template_args
        String tree_type
    }

    command <<<
    set -Euxo pipefail
    # setup
    export AWS_REGION=~{aws_region}
    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    export S3_FILESTEM=~{s3_filestem}
    export GROUP_NAME=~{group_name}
    export TEMPLATE_FILENAME=~{template_filename}
    export TEMPLATE_ARGS=~{template_args}
    export TREE_TYPE=~{tree_type}

    # Just in case the run script bails out before defining these vars
    export ncov_git_rev="NONE"
    export workflow_id=-1

    # run main workflow
    cd /usr/src/app/aspen/workflows/nextstrain_run
    ./run_nextstrain_scheduled.sh

    # error handling
    if [[ $? != 0 ]]; then
        end_time=$(date +%s)
        python3 /usr/src/app/aspen/workflows/nextstrain_run/error.py            \
        --ncov-rev "${ncov_git_rev}"                                            \
        --end-time "${end_time}"                                                \
        --phylo-run-id "${workflow_id}"                                         \

        exit 1
    fi
    >>>

    runtime {
        docker: docker_image_id
    }
}
