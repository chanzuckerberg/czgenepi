version 1.1

workflow pangolin {
    input {
        String docker_image_id = "pangolin:latest"
        String aws_region = "us-west-2"
        Array[String] samples
    }

    call pangolin_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        samples = samples,
    }
}

task pangolin_workflow {
    input {
        String docker_image_id
        String aws_region
        Array[String] samples
    }

    command <<<
    cd /usr/src/app/aspen/workflows/pangolin
    ./run_pangolin.sh "~{samples}"
    >>>

    runtime {
        docker: docker_image_id
    }
}

