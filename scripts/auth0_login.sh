#!/bin/bash
# Fetch certain secrets that make local dev work better from *real* AWS
# so we can feed them to localstack (fake aws)

# CI doesn't support profiles right now, so work around it.
PROFILE="--profile genepi-dev"
# GitHub actions can't handle our remapped DNS or AWS profiles :'(
if [ -n "${CI}" ]; then
	PROFILE=""
fi
# Fetch some additional data from real-aws to populate in our fake-aws secret.
EXTRA_SECRETS=$(aws ${PROFILE} secretsmanager get-secret-value --secret-id localdev/genepi-config-secrets --query SecretString --output text)

export AWS_REGION=us-west-2
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=nonce
export AWS_SECRET_ACCESS_KEY=nonce
export AWS_PAGER=""

export FRONTEND_URL=http://frontend.genepinet.localdev:8000
export BACKEND_URL=http://backend.genepinet.localdev:3000
export LOCALSTACK_URL=http://localstack.genepinet.localdev:4566


ONETRUST_FRONTEND_KEY=$(jq -c .ONETRUST_FRONTEND_KEY <<< "${EXTRA_SECRETS}")
PLAUSIBLE_FRONTEND_KEY=$(jq -c .PLAUSIBLE_FRONTEND_KEY <<< "${EXTRA_SECRETS}")
AUTH0_MANAGEMENT_CLIENT_ID=$(jq -c .AUTH0_MANAGEMENT_CLIENT_ID <<< "${EXTRA_SECRETS}")
AUTH0_MANAGEMENT_CLIENT_SECRET=$(jq -c .AUTH0_MANAGEMENT_CLIENT_SECRET <<< "${EXTRA_SECRETS}")
AUTH0_MANAGEMENT_DOMAIN=$(jq -c .AUTH0_MANAGEMENT_DOMAIN <<< "${EXTRA_SECRETS}")
AUTH0_CLIENT_ID=$(jq -c .AUTH0_CLIENT_ID <<< "${EXTRA_SECRETS}")
AUTH0_CLIENT_SECRET=$(jq -c .AUTH0_CLIENT_SECRET <<< "${EXTRA_SECRETS}")
echo "Creating secretsmanager secrets"
local_aws="aws --no-paginate --endpoint-url=${LOCALSTACK_URL}"
${local_aws} secretsmanager create-secret --name genepi-config &> /dev/null || true
# AUSPICE_MAC_KEY is just the result of urlsafe_b64encode(b'auspice-mac-key')
${local_aws} secretsmanager update-secret --secret-id genepi-config --secret-string '{
  "AUSPICE_MAC_KEY": "YXVzcGljZS1tYWMta2V5",
  "AUTH0_CALLBACK_URL": "'"${BACKEND_URL}"'/callback",
  "AUTH0_CLIENT_ID": '"${AUTH0_CLIENT_ID}"',
  "AUTH0_CLIENT_SECRET": '"${AUTH0_CLIENT_SECRET}"',
  "AUTH0_DOMAIN": '"${AUTH0_MANAGEMENT_DOMAIN}"',
  "AUTH0_CLIENT_KWARGS": {"scope": "openid profile email offline_access"},
  "FLASK_SECRET": "DevelopmentKey",
  "SPLIT_BACKEND_KEY": "localhost",
  "DB_rw_username": "user_rw",
  "DB_rw_password": "password_rw",
  "DB_address": "database.genepinet.localdev",
  "S3_external_auspice_bucket": "genepi-external-auspice-data",
  "S3_db_bucket": "genepi-db-data",
  "ONETRUST_FRONTEND_KEY": '"${ONETRUST_FRONTEND_KEY}"',
  "PLAUSIBLE_FRONTEND_KEY": '"${PLAUSIBLE_FRONTEND_KEY}"',
  "AUTH0_MANAGEMENT_CLIENT_ID": '"${AUTH0_MANAGEMENT_CLIENT_ID}"',
  "AUTH0_MANAGEMENT_CLIENT_SECRET": '"${AUTH0_MANAGEMENT_CLIENT_SECRET}"',
  "AUTH0_MANAGEMENT_DOMAIN": '"${AUTH0_MANAGEMENT_DOMAIN}"'
}' || true

docker compose exec backend supervisorctl restart fastapi
