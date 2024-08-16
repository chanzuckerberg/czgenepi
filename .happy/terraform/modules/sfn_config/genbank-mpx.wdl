version 1.1

workflow LoadGenBankMPX {
    input {
        String docker_image_id = "genepi-gisaid"
        String aws_region = "us-west-2"
        String genepi_config_secret_name
        String remote_dev_prefix = ""
        String genbank_metadata_url = "https://data.nextstrain.org/files/workflows/mpox/metadata.tsv.gz"
        String genbank_alignment_url = "https://data.nextstrain.org/files/workflows/mpox/alignment.fasta.xz"
    }

    call IngestGenBankMPX {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_metadata_url = genbank_metadata_url,
        genbank_alignment_url = genbank_alignment_url,
    }
    call ImportGenbankMPX {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_metadata = IngestGenBankMPX.genbank_metadata,
    }

    call ImportLocations {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_import_complete = ImportGenbankMPX.genbank_import_complete,
    }

    call ImportLatlongs {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        import_locations_complete = ImportLocations.import_locations_complete,
    }

    call ImportISLs {
        input:
        docker_image_id = docker_image_id,
        aws_region = aws_region,
        genepi_config_secret_name = genepi_config_secret_name,
        remote_dev_prefix = remote_dev_prefix,
        genbank_import_complete = ImportGenbankMPX.genbank_import_complete,
    }

    output {
        String entity_id = IngestGenBankMPX.entity_id
        String import_locations_complete = ImportLocations.import_locations_complete
    }
}

task IngestGenBankMPX {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String genbank_alignment_url
        String genbank_metadata_url
    }

    command <<<
    set -Eeuo pipefail
    shopt -s inherit_errexit

    start_time=$(date +%s)
    build_id=$(date +%Y%m%d-%H%M)

    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi
    source /usr/src/app/aspen/workflows/wdl_setup.sh

    # These are set by the Dockerfile and the Happy CLI
    aspen_workflow_rev=$COMMIT_SHA
    aspen_creation_rev=$COMMIT_SHA

    # S3 target locations
    metadata_key="aligned_genbank_mpx_dump/${build_id}/metadata.tsv.xz"
    alignment_key="aligned_genbank_mpx_dump/${build_id}/alignment.fasta.xz"

    # fetch the nextstrain mpx sequences and save them to s3.
    wget "~{genbank_alignment_url}" --continue --tries=2 -O alignment.fasta.xz
    # xzcat alignment.fasta.xz | zstd -o alignment.fasta.zst
    ${aws} s3 cp alignment.fasta.xz "s3://${aspen_s3_db_bucket}/${alignment_key}"

    # fetch the nextstrain mpx metadata
    wget "~{genbank_metadata_url}" --continue --tries=2 -O metadata.tsv.gz
    gunzip metadata.tsv.gz

    # Add the column headers to the output metadata file
    head -n 1 metadata.tsv > filtered_metadata.tsv

    # get a list of all identifiers from alignment file, remove the reverse complement suffix, strip leading and trailing whitespace, and remove duplicates
    xzcat alignment.fasta.xz | grep "^>" | sed 's/>//g' | sed 's/ |(reverse complement)//g' | awk '{$1=$1};1' | uniq > identifiers.txt
    
    # filter the metadata file to only include the identifiers from the alignment file
    awk -F"\t" 'FNR==NR{a[$0];next} ($1 in a)' identifiers.txt metadata.tsv >> filtered_metadata.tsv
    
    # check which rows were filtered out
    dropped_records=$(awk -F"\t" 'FNR==NR{a[$1]=$1;next} !($1 in a) {print $1}' filtered_metadata.tsv metadata.tsv)
    if [ "$dropped_records" != "" ]; then
        echo "The following records were dropped from the metadata file:"
        echo "$dropped_records"
    fi
    
    # remove old metadata file and replace with filtered metadata file

    cp filtered_metadata.tsv metadata.tsv
    xz filtered_metadata.tsv
    mv filtered_metadata.tsv.xz metadata.tsv.xz 

    # save filtered metadata file to s3
    ${aws} s3 cp metadata.tsv.xz "s3://${aspen_s3_db_bucket}/${metadata_key}"

    end_time=$(date +%s)

    # create the objects
    python3 /usr/src/app/aspen/workflows/ingest_aligned_sequences/save.py  \
            --genbank-s3-bucket "${aspen_s3_db_bucket}"                    \
            --genbank-sequences-s3-key "${alignment_key}"                  \
            --genbank-metadata-s3-key "${metadata_key}"                    \
            --pathogen-slug "MPX"                                          \
            --start-time "${start_time}"                                   \
            --end-time "${end_time}"                                       \
            --public-repository "GenBank" > entity_id 

    >>>

    output {
        String entity_id = read_string("entity_id")
        File genbank_metadata = "metadata.tsv"
    }

    runtime {
        docker: docker_image_id
    }
}
task ImportGenbankMPX {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        File genbank_metadata
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_gisaid/save.py       \
            --metadata-file ~{genbank_metadata} \
            --pathogen-slug "MPX"  \
            --public-repository "GenBank" 1>&2
    echo done > genbank_import_complete
    >>>

    output {
        String genbank_import_complete = read_string("genbank_import_complete")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportLocations {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String genbank_import_complete
    }
    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}
    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_locations/save.py --pathogen MPX 1>&2
    echo done > import_locations_complete
    >>>

    output {
        String import_locations_complete = read_string("import_locations_complete")
    }
    runtime {
        docker: docker_image_id
    }
}
task ImportLatlongs {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String import_locations_complete
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_location_latlongs/save.py 1>&2
    echo done > import_latlongs_complete
    >>>

    output {
        String import_latlongs_complete = read_string("import_latlongs_complete")
    }

    runtime {
        docker: docker_image_id
    }
}

task ImportISLs {
    input {
        String docker_image_id
        String aws_region
        String genepi_config_secret_name
        String remote_dev_prefix
        String genbank_import_complete
    }

    command <<<
    set -Eeuo pipefail
    aws configure set region ~{aws_region}

    export GENEPI_CONFIG_SECRET_NAME=~{genepi_config_secret_name}
    if [ "~{remote_dev_prefix}" != "" ]; then
        export REMOTE_DEV_PREFIX="~{remote_dev_prefix}"
    fi

    export PYTHONUNBUFFERED=true
    python3 /usr/src/app/aspen/workflows/import_gisaid_isls/save.py --pathogen-slug "MPX" --public-repository "GenBank" 1>&2
    >>>

    runtime {
        docker: docker_image_id
    }
}

