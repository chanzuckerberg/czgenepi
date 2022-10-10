version 1.1

workflow nextstrain {

    input {
        String docker_image_id = "genepi-nextstrain"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String group
        String s3_filestem
        String template_args
        String tree_type
    }

    call nextstrain_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        group = group,
        s3_filestem = s3_filestem,
        template_args = template_args,
        tree_type = tree_type
    }
}


task nextstrain_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String group
        String s3_filestem
        String template_args
        String tree_type
    }

    command <<<
    set -Eeuxo pipefail
    shopt -s inherit_errexit

    df 1>&2
    cat /proc/meminfo 1>&2

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    aws configure set region ~{aws_region}

    # fetch genepi config
    genepi_config="$(aws secretsmanager get-secret-value --secret-id ~{genepi_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"

    workflow_id=$(python3 /usr/src/app/aspen/workflows/nextstrain_run/create_phyloruns.py launch \
                      "~{group}"                \
                      --tree-type "~{tree_type}"   \
                      --template-args '~{template_args}'
    )

    # set up ncov. keep the fetch command in case want to overwrite the version in Docker image
#    (rm -r /ncov
#     mkdir /ncov
#     cd /ncov &&
#     git init &&
#     git fetch --depth 1 https://github.com/chanzuckerberg/ncov.git danrlu/move_to_fork &&
#     git checkout FETCH_HEAD
#    )
    ncov_git_rev=$(cd /ncov && git rev-parse HEAD)

    mkdir -p /ncov/my_profiles/aspen /ncov/results
    cp /usr/src/app/aspen/workflows/nextstrain_run/nextstrain_profile/* /ncov/my_profiles/aspen/

    # dump the sequences, metadata, and builds.yaml for a run out to disk.
    aligned_gisaid_location=$(
        python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py \
               --phylo-run-id "${workflow_id}"                        \
               --sequences /ncov/data/sequences_aspen.fasta           \
               --metadata /ncov/data/metadata_aspen.tsv               \
               --selected /ncov/data/include.txt                      \
               --builds-file /ncov/my_profiles/aspen/builds.yaml      \
    )
    aligned_gisaid_s3_bucket=$(echo "${aligned_gisaid_location}" | jq -r .bucket)
    aligned_gisaid_sequences_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .sequences_key)
    aligned_gisaid_metadata_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .metadata_key)

    # fetch the gisaid dataset
    aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_sequences_s3_key}" /ncov/results/
    aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_metadata_s3_key}" /ncov/results/

    >&2 echo "You should exec into the docker container and run \"snakemake --printshellcmds auspice/ncov_aspen.json --profile my_profiles/aspen/  --resources=mem_mb=312320\" in the ncov subdirectory"
    >&2 echo "When you are done with the docker container, run \"touch /done\"."

    while true; do
        [ -e /done ] && break
        sleep 5
    done
    >>>

    runtime {
        docker: docker_image_id
    }
}
