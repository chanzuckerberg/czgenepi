version 1.1

workflow covidhub_import {
    input {
        String docker_image_id = "covidhub-import"
        String aws_region = "us-west-2"
    }

    call covidhub_import_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
    }
}

task covidhub_import_workflow {
    input {
        String docker_image_id
        String aws_region
    }

    command <<<
    echo "RUNNING MIGRATE SCRIPT"
    chmod +x /usr/src/app/scripts/migrate-all.sh
    /usr/src/app/scripts/migrate-all.sh
    >>>

    runtime {
        docker: docker_image_id
    }
}

