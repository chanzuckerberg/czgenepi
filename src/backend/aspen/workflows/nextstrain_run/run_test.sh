#!/bin/bash
export GENEPI_CONFIG_SECRET_NAME="genepi-config"
export TEMPLATE_ARGS_FILE="args.json"
export GROUP_NAME="CZI"
export S3_FILESTEM="CZI_SCHEDULED_RUN"
export TREE_TYPE="targeted"
echo "{}" > $TEMPLATE_ARGS_FILE

./run_nextstrain_ondemand.sh

