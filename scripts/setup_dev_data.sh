#!/bin/bash
# Fetch certain secrets that make local dev work better from *real* AWS
# so we can feed them to localstack (fake aws)

# CI doesn't support profiles right now, so work around it.
PROFILE="--profile genepi-dev"
# GitHub actions can't handle our remapped DNS or AWS profiles :'(
if [ -n "${CI}" ]; then
	PROFILE=""
fi
EXTRA_SECRETS=$(aws ${PROFILE} secretsmanager get-secret-value --secret-id localdev/genepi-config-secrets --query SecretString --output text)

export AWS_REGION=us-west-2
export AWS_DEFAULT_REGION=us-west-2
export AWS_ACCESS_KEY_ID=nonce
export AWS_SECRET_ACCESS_KEY=nonce

export FRONTEND_URL=http://frontend.genepinet.localdev:8000
export BACKEND_URL=http://backend.genepinet.localdev:3000
export LOCALSTACK_URL=http://localstack.genepinet.localdev:4566

# How the backend can reach the OIDC idp
export OIDC_INTERNAL_URL=http://oidc.genepinet.localdev
# How a web browser can reach the OIDC idp
export OIDC_BROWSER_URL=https://oidc.genepinet.localdev:8443

# Wait for localstack services to start up
echo "wait for localstack to start"
until [ $(curl -m 1 -s $LOCALSTACK_URL/health | grep -o running | wc -l) -eq "5" ]; do 
  curl -m 1 -s $LOCALSTACK_URL/health
  echo
  sleep 1;
done

# Wait for oidc to start up
echo "wait for oidc to start"
until curl -m 1 -sk $OIDC_BROWSER_URL/.well-known/openid-configuration; do
  sleep 1;
done


ONETRUST_FRONTEND_KEY=$(jq -c .ONETRUST_FRONTEND_KEY <<< "${EXTRA_SECRETS}")
echo "Creating secretsmanager secrets"
local_aws="aws --endpoint-url=${LOCALSTACK_URL}"
${local_aws} secretsmanager create-secret --name genepi-config &> /dev/null || true
# AUSPICE_MAC_KEY is just the result of urlsafe_b64encode(b'auspice-mac-key')
${local_aws} secretsmanager update-secret --secret-id genepi-config --secret-string '{
  "AUSPICE_MAC_KEY": "YXVzcGljZS1tYWMta2V5",
  "AUTH0_CLIENT_ID": "local-client-id",
  "AUTH0_CALLBACK_URL": "'"${BACKEND_URL}"'/callback",
  "AUTH0_CLIENT_SECRET": "local-client-secret",
  "AUTH0_DOMAIN": "oidc.genepinet.localdev:8443",
  "AUTH0_BASE_URL": "'"${OIDC_INTERNAL_URL}"'",
  "AUTH0_SERVER_METADATA_URL": "'"${OIDC_INTERNAL_URL}"'/.well-known/openid-configuration",
  "AUTH0_ACCESS_TOKEN_URL": "'"${OIDC_INTERNAL_URL}"'/connect/token",
  "AUTH0_AUTHORIZE_URL": "'"${OIDC_BROWSER_URL}"'/connect/authorize",
  "AUTH0_CLIENT_KWARGS": {"scope": "openid profile email offline_access"},
  "FLASK_SECRET": "DevelopmentKey",
  "SPLIT_BACKEND_KEY": "localhost",
  "DB_rw_username": "user_rw",
  "DB_rw_password": "password_rw",
  "DB_address": "database.genepinet.localdev",
  "S3_external_auspice_bucket": "genepi-external-auspice-data",
  "S3_db_bucket": "genepi-db-data",
  "ONETRUST_FRONTEND_KEY": '"${ONETRUST_FRONTEND_KEY}"'
}' || true

echo "Creating IAM role"
${local_aws} iam create-role --role-name sfnrole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "states.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

echo "Creating SFN"
${local_aws} stepfunctions create-state-machine --name swipe-sfn --role-arn arn:aws:iam::000000000000:role/sfnrole --definition '{"Comment":"SWIPE single-wdl pipeline entry point","StartAt":"PreprocessInput","States":{"HandleFailure":{"End":true,"OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-handle-failure","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"HandleSuccess":{"End":true,"OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-handle-success","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"PreprocessInput":{"Next":"RunSPOT","OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-preprocess-input","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"RunDetectError":{"Choices":[{"Next":"RunEC2","StringMatches":"Host EC2 (instance i-*) terminated.","Variable":"$.BatchJobError.RunSPOT.Cause.StatusReason"}],"Default":"RunReadOutput","Type":"Choice"},"RunEC2":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"RunReadOutput","ResultPath":"$.BatchJobError.RunEC2"}],"Next":"RunReadOutput","Parameters":{"ContainerOverrides":{"Environment":[{"Name":"AWS_DEFAULT_REGION","Value":"us-west-2"},{"Name":"REMOTE_DEV_PREFIX","Value":"/sfn-exec"},{"Name":"DEPLOYMENT_STAGE","Value":"rdev"},{"Name":"WDL_INPUT_URI","Value.$":"$.RUN_INPUT_URI"},{"Name":"WDL_WORKFLOW_URI","Value.$":"$.RUN_WDL_URI"},{"Name":"WDL_OUTPUT_URI","Value.$":"$.RUN_OUTPUT_URI"},{"Name":"SFN_EXECUTION_ID","Value.$":"$$.Execution.Id"},{"Name":"SFN_CURRENT_STATE","Value.$":"$$.State.Name"}],"Memory.$":"$.RunEC2Memory","Vcpus.$":"$.RunEC2Vcpu"},"JobDefinition":"aspen-rdev-sfn-exec-swipe","JobName.$":"$$.Execution.Name","JobQueue":"arn:aws:batch:us-west-2:000000000000:job-queue/rdev-aspen-batch-EC2","Timeout":{"AttemptDurationSeconds":54000}},"Resource":"arn:aws:states:::batch:submitJob.sync","ResultPath":"$.BatchJobDetails.Run","Retry":[{"BackoffRate":2,"ErrorEquals":["Batch.AWSBatchException"],"IntervalSeconds":15,"MaxAttempts":3}],"Type":"Task"},"RunGetCause":{"Next":"RunDetectError","Parameters":{"Cause.$":"States.StringToJson($.BatchJobError.RunSPOT.Cause)"},"ResultPath":"$.BatchJobError.RunSPOT","Type":"Pass"},"RunReadOutput":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"HandleFailure"}],"Next":"HandleSuccess","OutputPath":"$.Payload","Parameters":{"FunctionName":"swipe-aspen-rdev-process-stage-output","Payload":{"CurrentState.$":"$$.State.Name","ExecutionId.$":"$$.Execution.Id","Input.$":"$"}},"Resource":"arn:aws:states:::lambda:invoke","Type":"Task"},"RunSPOT":{"Catch":[{"ErrorEquals":["States.ALL"],"Next":"RunGetCause","ResultPath":"$.BatchJobError.RunSPOT"}],"Next":"RunReadOutput","Parameters":{"ContainerOverrides":{"Environment":[{"Name":"AWS_DEFAULT_REGION","Value":"us-west-2"},{"Name":"REMOTE_DEV_PREFIX","Value":"/sfn-exec"},{"Name":"DEPLOYMENT_STAGE","Value":"rdev"},{"Name":"WDL_INPUT_URI","Value.$":"$.RUN_INPUT_URI"},{"Name":"WDL_WORKFLOW_URI","Value.$":"$.RUN_WDL_URI"},{"Name":"WDL_OUTPUT_URI","Value.$":"$.RUN_OUTPUT_URI"},{"Name":"SFN_EXECUTION_ID","Value.$":"$$.Execution.Id"},{"Name":"SFN_CURRENT_STATE","Value.$":"$$.State.Name"}],"Memory.$":"$.RunSPOTMemory","Vcpus.$":"$.RunSPOTVcpu"},"JobDefinition":"aspen-rdev-sfn-exec-swipe","JobName.$":"$$.Execution.Name","JobQueue":"arn:aws:batch:us-west-2:000000000000:job-queue/rdev-aspen-batch-SPOT","Timeout":{"AttemptDurationSeconds":54000}},"Resource":"arn:aws:states:::batch:submitJob.sync","ResultPath":"$.BatchJobDetails.Run","Retry":[{"BackoffRate":2,"ErrorEquals":["Batch.AWSBatchException"],"IntervalSeconds":15,"MaxAttempts":3}],"Type":"Task"}},"TimeoutSeconds":259200}'
LOCAL_SFN_ARN=$(${local_aws} stepfunctions list-state-machines | jq '.stateMachines | .[0] | .stateMachineArn')

echo "Creating SSM Parameters"
# Delete any previous values so we have updated values when we run this script
# Otherwise updating these is more painful since the only other script that cleans them
# is make local-clean, which is overkill
${local_aws} ssm delete-parameter --name /genepi/local/localstack/pangolin-ondemand-sfn
${local_aws} ssm put-parameter --name /genepi/local/localstack/pangolin-ondemand-sfn --value '{
  "Input":{
    "Run":{
      "genepi_config_secret_name":"genepi-config",
      "aws_region":"us-west-2",
      "docker_image_id":"genepi-pangolin",
      "remote_dev_prefix":""}
    },
  "OutputPrefix":"s3://genepi-batch/pangolin-ondemand-sfn/results",
  "RUN_WDL_URI":"s3://genepi-batch/pangolin-ondemand.wdl-v0.0.1.wdl",
  "RunEC2Memory":64000,
  "RunEC2Vcpu":10,
  "RunSPOTMemory":64000,
  "RunSPOTVcpu":10,
  "StateMachineArn":'${LOCAL_SFN_ARN}'
}'
${local_aws} ssm delete-parameter --name /genepi/local/localstack/nextstrain-ondemand-sfn
${local_aws} ssm put-parameter --name /genepi/local/localstack/nextstrain-ondemand-sfn --value '{
  "Input":{
    "Run":{
      "genepi_config_secret_name":"genepi-config",
      "aws_region":"us-west-2",
      "docker_image_id":"genepi-nextstrain",
      "remote_dev_prefix":""}
    },
  "OutputPrefix":"s3://genepi-batch/nextstrain-ondemand-sfn/results",
  "RUN_WDL_URI":"s3://genepi-batch/nextstrain-ondemand.wdl-v0.0.1.wdl",
  "RunEC2Memory":64000,
  "RunEC2Vcpu":10,
  "RunSPOTMemory":64000,
  "RunSPOTVcpu":10,
  "StateMachineArn":'${LOCAL_SFN_ARN}'
}'
${local_aws} ssm delete-parameter --name /genepi/local/localstack/nextstrain-sfn
${local_aws} ssm put-parameter --name /genepi/local/localstack/nextstrain-sfn --value '{
  "Input":{
    "Run":{
      "genepi_config_secret_name":"genepi-config",
      "aws_region":"us-west-2",
      "docker_image_id":"genepi-nextstrain",
      "remote_dev_prefix":""}
    },
  "OutputPrefix":"s3://genepi-batch/nextstrain-sfn/results",
  "RUN_WDL_URI":"s3://genepi-batch/nextstrain.wdl-v0.0.1.wdl",
  "RunEC2Memory":64000,
  "RunEC2Vcpu":10,
  "RunSPOTMemory":64000,
  "RunSPOTVcpu":10,
  "StateMachineArn":'${LOCAL_SFN_ARN}'
}'
${local_aws} ssm delete-parameter --name /genepi/local/localstack/pangolin-ondemand-sfn
${local_aws} ssm put-parameter --name /genepi/local/localstack/pangolin-ondemand-sfn --value '{
  "Input":{
    "Run":{
      "aws_region":"us-west-2",
      "docker_image_id":"genepi-pangolin"}
    },
  "OutputPrefix":"s3://aspen-batch/pangolin-ondemand-sfn/results",
  "RUN_WDL_URI":"s3://aspen-batch/pangolin-ondemand.wdl-v0.0.1.wdl",
  "RunEC2Memory":120000,
  "RunEC2Vcpu":1,
  "RunSPOTMemory":120000,
  "RunSPOTVcpu":1,
  "StateMachineArn":'${LOCAL_SFN_ARN}'
}'

echo "Creating s3 buckets"
${local_aws} s3api head-bucket --bucket genepi-external-auspice-data || ${local_aws} s3 mb s3://genepi-external-auspice-data
${local_aws} s3api head-bucket --bucket genepi-db-data || ${local_aws} s3 mb s3://genepi-db-data
${local_aws} s3api head-bucket --bucket genepi-gisaid-data || ${local_aws} s3 mb s3://genepi-gisaid-data
${local_aws} s3api head-bucket --bucket genepi-batch || ${local_aws} s3 mb s3://genepi-batch
echo
echo "Dev env is up and running!"
echo "  Frontend: ${FRONTEND_URL}"
echo "  Backend: ${BACKEND_URL}"
