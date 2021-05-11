version 1.1

workflow nextstrain {

    input {
        String docker_image_id = "aspen-nextstrain"
        String aws_region = "us-west-2"
        Int phylo_run_id = 4
    }

    call nextstrain_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        phylo_run_id = phylo_run_id
    }
}


task nextstrain_workflow {
    input {
        String docker_image_id
        String aws_region
        Int phylo_run_id
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit
    cd /aspen/src/backend/aspen/workflows/nextstrain_run
    sh build_tree.sh ~{phylo_run_id}
    >>>

    runtime {
        docker: docker_image_id
    }

}