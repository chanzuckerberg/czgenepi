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
        template_args = template_args
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
    }

    command <<<
    set -Eeuxo pipefail
    shopt -s inherit_errexit

    df 1>&2
    cat /proc/meminfo 1>&2

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    export ASPEN_CONFIG_SECRET_NAME=~{aspen_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    aws configure set region ~{aws_region}

    # fetch aspen config
    aspen_config="$(aws secretsmanager get-secret-value --secret-id ~{aspen_config_secret_name} --query SecretString --output text)"
    aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$aspen_config")"

    workflow_id=$(aspen-cli db create-phylo-run                                                                                  \
                      --group-name "~{group_name}"                                                                               \
                      --all-group-sequences                                                                                      \
                      --builds-template-file /usr/src/app/aspen/workflows/nextstrain_run/builds_templates/~{template_filename}   \
                      --builds-template-args '~{template_args}'
    )

    # set up ncov
    mkdir -p /ncov/my_profiles/aspen /ncov/results
    cd /ncov
    git init
    git fetch --depth 1 git://github.com/nextstrain/ncov.git
    git checkout FETCH_HEAD
    ncov_git_rev=$(git rev-parse HEAD)

    # patch ncov/scripts/combine-and-dedup-fastas.py
    patch -p1 < /usr/src/app/aspen/workflows/nextstrain_run/combine-and-dedup-fastas.py.patch

    cp /usr/src/app/aspen/workflows/nextstrain_run/nextstrain_profile/* /ncov/my_profiles/aspen/

    # dump the sequences, metadata, and builds.yaml for a run out to disk.
    aligned_gisaid_location=$(
        python3 /usr/src/app/aspen/workflows/nextstrain_run/export.py \
               --phylo-run-id "${workflow_id}"                        \
               --sequences /ncov/data/sequences_aspen.fasta           \
               --metadata /ncov/data/metadata_aspen.tsv               \
               --builds-file /ncov/my_profiles/aspen/builds.yaml      \
    )
    aligned_gisaid_s3_bucket=$(echo "${aligned_gisaid_location}" | jq -r .bucket)
    aligned_gisaid_sequences_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .sequences_key)
    aligned_gisaid_metadata_s3_key=$(echo "${aligned_gisaid_location}" | jq -r .metadata_key)

    # fetch the gisaid dataset
    aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_sequences_s3_key}" - | zstdmt -d | xz -2 > /ncov/results/aligned_gisaid.fasta.xz
    aws s3 cp --no-progress "s3://${aligned_gisaid_s3_bucket}/${aligned_gisaid_metadata_s3_key}" /ncov/data/metadata_gisaid.tsv

    snakemake --printshellcmds auspice/ncov_aspen.json --profile my_profiles/aspen/  --resources=mem_mb=312320

    # upload the tree to S3
    key="phylo_run/${build_id}/~{s3_filestem}.json"
    aws s3 cp /ncov/auspice/ncov_aspen.json "s3://${aspen_s3_db_bucket}/${key}"

    # update aspen
    aspen_workflow_rev=WHATEVER
    aspen_creation_rev=WHATEVER

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/nextstrain_run/save.py                 \
        --aspen-workflow-rev "${aspen_workflow_rev}"                            \
        --aspen-creation-rev "${aspen_creation_rev}"                            \
        --ncov-rev "${ncov_git_rev}"                                            \
        --aspen-docker-image-version ""                                         \
        --end-time "${end_time}"                                                \
        --phylo-run-id "${workflow_id}"                                         \
        --bucket "${aspen_s3_db_bucket}"                                        \
        --key "${key}"                                                          \
        --tree-path /ncov/auspice/ncov_aspen.json                               \
    >>>

    runtime {
        docker: docker_image_id
    }
}
