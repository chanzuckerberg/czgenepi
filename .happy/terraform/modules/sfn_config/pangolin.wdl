version 1.1

workflow pangolin {
    input {
        String docker_image_id = "pangolin:latest"
        String aws_region = "us-west-2"
    }

    call pangolin_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
    }
}

task pangolin_workflow {
    input {
        String docker_image_id
        String aws_region
    }

    command <<<
    cd /usr/src/app/aspen/workflows/pangolin
    /usr/local/bin/python3.9 find_samples.py

    runtime {
        docker: docker_image_id
    }
}

