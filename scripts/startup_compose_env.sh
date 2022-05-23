#!/bin/bash -e
export AWS_REGION=us-west-2
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=nonce
export AWS_SECRET_ACCESS_KEY=nonce
SECRETS=$(aws --endpoint-url http://localhost:4566 secretsmanager get-secret-value --secret-id genepi-config --query SecretString --output text)
eval "$(jq -r '.| to_entries | .[] | select(.key != "AUTH0_CLIENT_KWARGS") | "export " + .key + "=" + (.value | @sh)' <<< "${SECRETS}")"
export docker_compose="docker compose --env-file .env.ecr"
export LOCALDEV_PROFILE="web"
# We only really need to restart the frontend.
${docker_compose} --profile ${LOCALDEV_PROFILE} up -d frontend
