export AWS_REGION=us-west-2
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=nonce
export AWS_SECRET_ACCESS_KEY=nonce

# NOTE: This script is intended to run INSIDE the dockerized dev environment!
# If you need to run it directly on your laptop for some reason, change
# localstack below to localhost
#export LOCALSTACK_URL=http://localstack:4566
export LOCALSTACK_URL=http://localhost:4566

echo "Creating secretsmanager secrets"
local_aws="aws --endpoint-url=${LOCALSTACK_URL}"
${local_aws} secretsmanager create-secret --name corpora/backend/dev/auth0-secret &> /dev/null || true
${local_aws} secretsmanager update-secret --secret-id aspen-config --secret-string '{"AUTH0_CLIENT_ID":"foo", "AUTH0_DOMAIN":"foo", "AUTH0_CLIENT_SECRET":"bar"}' || true
