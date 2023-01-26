version 1.1

workflow lineage_qc_ondemand {
    input {
        String docker_image_id = "genepi-lineage-qc"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String pathogen_slug
        # `run_type`: See workflow's `prep_samples.py` for allowed values
        String run_type = "specified-ids-only"
        # `sample_ids` is ignored for run types that are not specified-ids-only
        Array[Int] sample_ids = []
    }

    call lineage_qc_ondemand_workflow {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        pathogen_slug = pathogen_slug,
        run_type = run_type,
        sample_ids = sample_ids,
    }
}

task lineage_qc_ondemand_workflow {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String pathogen_slug
        String run_type
        Array[Int] sample_ids
    }

    command <<<
    set -Euxo pipefail
    # All the `1>&2` below is so miniwdl will log our messages since stdout
    # is effectively ignored in preference of only logging stderr
    echo "Starting task for processing lineage QC" 1>&2

    # Setup env vars for configs that expect them to be there.
    export AWS_REGION="~{aws_region}"
    export GENEPI_CONFIG_SECRET_NAME="~{genepi_config_secret_name}"
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    # Ensure we start in an empty directory for the run.
    WORKING_DIR=nextclade_run
    mkdir "${WORKING_DIR}"
    cd "${WORKING_DIR}"

    export PATHOGEN_SLUG="~{pathogen_slug}"
    export RUN_TYPE="~{run_type}"
    export SAMPLE_IDS_FILENAME="sample_ids.txt"
    # While `sample_ids` is Array[Int], WDL auto coerces to strings, as we want
    echo "~{sep('\n', sample_ids)}" > $SAMPLE_IDS_FILENAME
    /usr/src/app/aspen/workflows/nextclade/run_nextclade.sh 1>&2
    >>>

    runtime {
        docker: docker_image_id
    }
}
