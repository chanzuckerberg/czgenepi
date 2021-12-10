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

    cd /usr/src/app/aspen/workflows/pangolin
    ./update_pangolin.sh
    /usr/local/bin/python3.9 find_samples.py
    >>>

    runtime {
        docker: docker_image_id
    }
}

