set -Eeuo pipefail
shopt -s inherit_errexit

if [ -n "${BOTO_ENDPOINT_URL-}" ]; then
  export aws="aws --endpoint-url ${BOTO_ENDPOINT_URL}"
else
  export aws="aws"
fi

# fetch aspen config
set +x  # don't echo secrets
echo "* set \$genepi_config (not printing value because contains secrets)"
export genepi_config="$(${aws} secretsmanager get-secret-value --secret-id ${GENEPI_CONFIG_SECRET_NAME} --query SecretString --output text)"
echo "* set \$aspen_s3_db_bucket"
export aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"
export aspen_s3_db_bucket="$(jq -r .S3_db_bucket <<< "$genepi_config")"

gisaid_credentials=$(${aws} secretsmanager get-secret-value --secret-id gisaid-download-credentials --query SecretString --output text)
export gisaid_username=$(echo "${gisaid_credentials}" | jq -r .username)
export gisaid_password=$(echo "${gisaid_credentials}" | jq -r .password)
set -x
