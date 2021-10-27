version 1.1

workflow pangolin {
    input {
        String docker_image_id = "pangolin:latest"
        String aws_region = "us-west-2"
        String aspen_config_secret_name
        String remote_dev_prefix = ""
        Array[String] samples
    }

    call pangolin_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        aspen_config_secret_name = aspen_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        samples = samples,
    }
}

task pangolin_workflow {
    input {
        String docker_image_id
        String aws_region
        String aspen_config_secret_name
        String remote_dev_prefix 
        Array[String] samples
    }

    command <<<
    export ASPEN_CONFIG_SECRET_NAME="~{aspen_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    cd /usr/src/app/aspen/workflows/pangolin
    ./run_pangolin.sh ~{sep(' ', samples)}
    >>>

    runtime {
        docker: docker_image_id
    }
}

